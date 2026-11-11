<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

#[Signature('app:transfer-sqlite-to-mysql {--source= : Path to the source SQLite database file} {--force : Replace existing target MySQL rows}')]
#[Description('Copy LinyJaya workspace tables from SQLite into the configured MySQL database')]
class TransferSqliteToMysql extends Command
{
    /**
     * Ordered tables respecting foreign-key dependencies.
     *
     * @var list<string>
     */
    private const TABLES = [
        'employees',
        'users',
        'password_reset_tokens',
        'projects',
        'units',
        'bookings',
        'payments',
        'tasks',
        'reports',
        'leads',
        'expenses',
        'tickets',
        'announcements',
        'attendance',
        'leave_requests',
        'documents',
        'services',
        'partners',
        'articles',
        'property_audits',
        'offers',
        'promos',
        'communications',
        'schedules',
        'messages',
        'property_notifications',
        'evaluations',
        'workspace_settings',
        'property_favorites',
        'property_notification_reads',
        'property_attachments',
        'property_revisions',
    ];

    public function handle(): int
    {
        if (DB::getDefaultConnection() !== 'mysql') {
            $this->error('Default database connection must be mysql.');

            return self::FAILURE;
        }

        $sourcePath = $this->option('source') ?: database_path('database.sqlite');
        if (! is_file($sourcePath)) {
            $this->error('Source SQLite database not found: '.$sourcePath);

            return self::FAILURE;
        }

        config(['database.connections.sqlite_transfer' => [
            'driver' => 'sqlite',
            'database' => $sourcePath,
            'foreign_key_constraints' => true,
        ]]);

        $source = DB::connection('sqlite_transfer');
        $target = DB::connection('mysql');
        $force = (bool) $this->option('force');

        $targetHasData = $target->table('users')->exists() || $target->table('projects')->exists();
        if ($targetHasData && ! $force) {
            $this->error('Target MySQL database already contains records. Pass --force to replace existing data.');

            return self::FAILURE;
        }

        $target->transaction(function () use ($source, $target, $force): void {
            if ($force) {
                Schema::connection('mysql')->disableForeignKeyConstraints();
                foreach (array_reverse(self::TABLES) as $table) {
                    $target->table($table)->delete();
                }
                Schema::connection('mysql')->enableForeignKeyConstraints();
            }

            foreach (self::TABLES as $table) {
                $rows = $source->table($table)->get()->map(fn ($row): array => (array) $row)->all();
                if ($rows !== []) {
                    $target->table($table)->insert($rows);
                }
            }
        });

        $this->info('Workspace tables transferred from SQLite to MySQL.');

        return self::SUCCESS;
    }
}
