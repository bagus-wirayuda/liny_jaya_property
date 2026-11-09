<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\Console\Command\Command;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('linyjaya:admin {email} {--name=Administrator}', function (): int {
    $identity = Validator::make(
        ['email' => $this->argument('email'), 'name' => $this->option('name')],
        ['email' => ['required', 'email:rfc', 'max:240', 'unique:users'], 'name' => ['required', 'string', 'max:120']],
    );
    if ($identity->fails()) {
        $this->error($identity->errors()->first());

        return Command::FAILURE;
    }
    if (! $this->input->isInteractive()) {
        $this->error('Jalankan perintah secara interaktif untuk memasukkan kata sandi.');

        return Command::FAILURE;
    }
    $password = $this->secret('Kata sandi (minimal 12 karakter)');
    $confirmation = $this->secret('Ulangi kata sandi');
    if (! is_string($password) || strlen($password) < 12 || strlen($password) > 72 || $password !== $confirmation) {
        $this->error('Kata sandi harus sama, dengan panjang 12–72 byte.');

        return Command::FAILURE;
    }
    $account = new User;
    $account->forceFill([...$identity->validated(), 'role' => 'admin', 'active' => true, 'password' => $password])->save();
    $this->info('Akun Administrator dibuat.');

    return Command::SUCCESS;
})->purpose('Buat akun Administrator LinyJaya secara interaktif');
