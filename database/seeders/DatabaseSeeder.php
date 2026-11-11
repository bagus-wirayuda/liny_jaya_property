<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\PaymentCalculator;
use App\Services\PropertyRecords;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(PropertyRecords $records): void
    {
        DB::transaction(function () use ($records): void {
            if (! $records->query('settings')->where('id', 'payment_methods')->exists()) {
                $records->put('settings', 'payment_methods', PaymentCalculator::defaultConfig());
            }
            if ($records->query('settings')->where('id', 'company')->exists()) {
                return;
            }
            $fixture = json_decode(file_get_contents(__DIR__.'/property-fixtures.json'), true, 512, JSON_THROW_ON_ERROR);
            $records->put('settings', 'company', $fixture['company']);
            $records->put('settings', 'workspace', $fixture['settings']);

            if (! app()->environment('local', 'testing')) {
                return;
            }
            $employees = [];
            foreach ($fixture['employees'] as $employee) {
                $employees[$employee['name']] = $employee['id'];
                $records->put('employees', $employee['id'], $employee);
            }
            $accounts = [
                ['Administrator', 'admin@linyjaya.example', 'admin', null],
                ['Maya Putri', 'maya@example.com', 'client', null],
                ['Andi Pratama', 'andi@linyjaya.example', 'client', null],
                ['Rafi Hidayat', 'rafi@example.com', 'employee', 'EMP-001'],
                ['Aditya Wijaya', 'aditya@example.com', 'director', null],
            ];
            $users = [];
            foreach ($accounts as [$name, $email, $role, $employee]) {
                $account = User::query()->firstOrNew(['email' => $email]);
                if (! $account->exists) {
                    $account->password = config('linyjaya.demo_password') ?: Str::password(32);
                }
                $account->forceFill([
                    'name' => $name, 'role' => $role, 'employee_id' => $employee,
                    'active' => true, 'email_verified_at' => now(),
                    'phone' => $name === 'Maya Putri' ? $fixture['profile']['phone'] : null,
                    'address' => $name === 'Maya Putri' ? $fixture['profile']['address'] : null,
                ])->save();
                $users[$name] = $account->id;
            }
            foreach (array_diff(PropertyRecords::GROUPS, ['employees']) as $group) {
                foreach ($fixture[$group] ?? [] as $record) {
                    $columns = [];
                    if (isset($record['employee'])) {
                        $columns['employee_id'] = $employees[$record['employee']];
                    }
                    if (in_array($group, ['bookings', 'tickets'], true)) {
                        $columns['client_id'] = $users[$record['client']];
                    }
                    if ($group === 'notifications') {
                        $columns['audience'] = array_search($record['role'], PropertyRecords::ROLES, true);
                        $columns['client_id'] = $users['Maya Putri'];
                    }
                    if ($group === 'messages') {
                        $columns['author_id'] = $users[$record['name']] ?? null;
                    }
                    if ($group !== 'offers') {
                        unset($record['client']);
                    }
                    unset($record['employee'], $record['role']);
                    $records->put($group, $record['id'], $record, $columns);
                }
            }
        });
    }
}
