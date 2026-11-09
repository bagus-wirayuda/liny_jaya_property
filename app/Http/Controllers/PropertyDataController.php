<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\PropertyChanges;
use App\Services\PropertyRecords;
use App\Services\PropertyState;
use App\Services\PropertyWorkflow;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PropertyDataController extends Controller
{
    public function __construct(
        private readonly PropertyState $state,
        private readonly PropertyRecords $records,
        private readonly PropertyChanges $changes,
        private readonly PropertyWorkflow $workflow,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $this->activeUser($request);
        $workspace = $request->boolean('workspace');
        abort_if($workspace && ! $user, 401);

        return response()->json(DB::transaction(fn () => $this->snapshot($request, $user, $workspace)))
            ->header('Cache-Control', 'private, no-store');
    }

    public function update(Request $request): JsonResponse
    {
        $user = $this->activeUser($request);
        $data = $request->validate([
            'workspace' => ['required', 'boolean'], 'revision' => ['required', 'integer', 'min:0'],
            'changes' => ['required', 'array', 'min:1', 'max:30'],
            'changes.*' => ['required', 'array:resource,id,operation,fields'],
            'changes.*.resource' => ['required', Rule::in([...PropertyRecords::GROUPS, 'company', 'settings', 'profile', 'accounts'])],
            'changes.*.id' => ['required', 'string', 'regex:/\A[\w-]{1,64}\z/'],
            'changes.*.operation' => ['required', 'in:create,update,delete'],
            'changes.*.fields' => ['sometimes', 'array', 'max:32'],
        ]);
        $workspace = (bool) $data['workspace'];
        abort_if($workspace && ! $user, 401);
        if (! $workspace) {
            abort_unless(count($data['changes']) === 1 && $data['changes'][0]['resource'] === 'leads', 403);
        }

        return $this->mutate($request, $user, $workspace, (int) $data['revision'], function () use ($data, $user, $workspace): void {
            foreach ($data['changes'] as $change) {
                $this->changes->apply($user, $workspace, $change);
                $this->records->audit($user, match ($change['operation']) {
                    'create' => 'Catatan ditambahkan',
                    'update' => 'Catatan diperbarui',
                    'delete' => 'Catatan dihapus',
                }.' · '.$change['resource'].' · '.$change['id']
                    .(isset($change['fields']['status']) ? ' · '.mb_strtolower($change['fields']['status']) : ''));
            }
        });
    }

    public function workflow(Request $request, string $action): JsonResponse
    {
        $user = $this->activeUser($request);
        abort_unless($user, 401);
        $data = $request->validate([
            'revision' => ['required', 'integer', 'min:0'],
            'input' => ['present', 'array', 'max:8'],
        ]);

        return $this->mutate($request, $user, true, (int) $data['revision'], fn () => $this->workflow->run($user, $action, $data['input']));
    }

    public function favorite(Request $request): JsonResponse
    {
        $user = $this->activeUser($request);
        $data = $request->validate([
            'id' => ['required', 'string', 'regex:/\A[\w-]{1,64}\z/'],
            'selected' => ['required', 'boolean'],
        ]);
        $id = $data['id'];
        abort_unless($this->records->query('projects')->where('id', $id)->exists()
            || $this->records->query('units')->where('id', $id)->exists(), 404);
        if ($user) {
            $key = ['user_id' => $user->id, 'property_id' => $id];
            if ($data['selected']) {
                DB::table('property_favorites')->insertOrIgnore($key);
            } else {
                DB::table('property_favorites')->where($key)->delete();
            }
        } else {
            $favorites = array_filter($request->session()->get('property_favorites', []), fn (string $entry): bool => $entry !== $id);
            if ($data['selected']) {
                $favorites[] = $id;
            }
            $request->session()->put('property_favorites', array_values(array_slice($favorites, -200)));
        }

        return response()->json(['selected' => (bool) $data['selected']]);
    }

    public function attachment(Request $request, string $id): Response
    {
        $attachment = DB::table('property_attachments')->where('id', $id)->first() ?? abort(404);
        $publicLogo = $attachment->resource === 'settings' && $attachment->record_id === 'company' && $attachment->field === 'logoData';
        if (! $publicLogo) {
            $user = $this->activeUser($request);
            abort_unless($user && ! ($user->role === 'director' && $attachment->resource === 'payments')
                && $this->state->visible($attachment->resource, $user)->where('id', $attachment->record_id)->exists(), 404);
        }
        $extension = match ($attachment->mime) {
            'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', default => 'pdf',
        };

        return response(base64_decode($attachment->content), 200, [
            'Content-Type' => $attachment->mime,
            'Content-Disposition' => 'inline; filename="linyjaya.'.$extension.'"',
            'Content-Security-Policy' => 'sandbox',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => $publicLogo ? 'public, max-age=86400' : 'private, no-store',
        ]);
    }

    private function activeUser(Request $request): ?User
    {
        $user = $request->user();
        abort_if($user && (! $user->active || ($user->role === 'employee' && ! $user->employee_id)), 403);

        return $user;
    }

    private function snapshot(Request $request, ?User $user, bool $workspace): array
    {
        return [
            'revision' => $this->state->version(),
            'data' => $this->state->snapshot($user, $workspace, $request->session()->get('property_favorites', [])),
        ];
    }

    private function mutate(Request $request, ?User $user, bool $workspace, int $revision, callable $save): JsonResponse
    {
        try {
            $result = DB::transaction(function () use ($request, $user, $workspace, $revision, $save): array {
                $lock = DB::table('property_revisions')->where('id', 1);
                abort_unless((int) $lock->lockForUpdate()->value('version') === $revision, 409, 'Data sudah berubah. Muat ulang halaman sebelum menyimpan kembali.');
                $save();
                $lock->increment('version');

                return $this->snapshot($request, $user?->fresh(), $workspace);
            }, 3);
        } catch (QueryException $error) {
            if (in_array($error->errorInfo[0] ?? null, ['23000', '23503', '23505'], true)) {
                throw ValidationException::withMessages(['record' => 'Data masih memiliki relasi aktif atau identitas yang sama.']);
            }
            throw $error;
        }

        return response()->json($result)->header('Cache-Control', 'private, no-store');
    }
}
