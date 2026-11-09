<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const TABLES = [
        'projects', 'employees', 'units', 'bookings', 'payments', 'tasks', 'reports',
        'leads', 'expenses', 'tickets', 'announcements', 'attendance', 'leave_requests',
        'documents', 'services', 'partners', 'articles', 'property_audits', 'offers',
        'promos', 'communications', 'schedules', 'messages', 'property_notifications',
        'evaluations', 'workspace_settings',
    ];

    public function up(): void
    {
        foreach (self::TABLES as $name) {
            Schema::create($name, function (Blueprint $table) use ($name): void {
                $table->string('id', 64)->primary();
                $table->json('payload');
                $table->timestamps();

                if (in_array($name, ['units', 'leads', 'expenses', 'promos'], true)) {
                    $table->string('project_id', 64)->nullable($name === 'leads');
                    $table->foreign('project_id')->references('id')->on('projects')->restrictOnDelete();
                }
                if (in_array($name, ['bookings', 'tasks', 'reports', 'offers', 'schedules', 'leads'], true)) {
                    $table->string('unit_id', 64)->nullable($name === 'leads');
                    $table->foreign('unit_id')->references('id')->on('units')->restrictOnDelete();
                }
                if (in_array($name, ['payments', 'documents'], true)) {
                    $table->string('booking_id', 64)->index();
                    $table->foreign('booking_id')->references('id')->on('bookings')->restrictOnDelete();
                }
                if (in_array($name, ['bookings', 'tickets', 'property_notifications'], true)) {
                    $table->foreignId('client_id')->nullable($name === 'property_notifications')->constrained('users')->restrictOnDelete();
                }
                if (in_array($name, ['tasks', 'reports', 'schedules', 'attendance', 'leave_requests', 'evaluations'], true)) {
                    $table->string('employee_id', 64)->index();
                    $table->foreign('employee_id')->references('id')->on('employees')->restrictOnDelete();
                }
                if (in_array($name, ['messages', 'property_audits'], true)) {
                    $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
                }
                if ($name === 'units') {
                    $table->string('block_key', 64);
                    $table->string('number_key', 64);
                    $table->unique(['project_id', 'block_key', 'number_key']);
                }
                if ($name === 'bookings') {
                    $table->string('reserved_unit', 64)->nullable()->unique();
                }
                if ($name === 'attendance') {
                    $table->date('work_date');
                    $table->unique(['employee_id', 'work_date']);
                }
                if ($name === 'property_notifications') {
                    $table->string('audience', 20)->index();
                    $table->string('employee_id', 64)->nullable();
                    $table->foreign('employee_id')->references('id')->on('employees')->restrictOnDelete();
                }
            });
        }

        Schema::table('users', function (Blueprint $table): void {
            $table->string('role', 20)->default('client')->index();
            $table->boolean('active')->default(true);
            $table->timestamp('archived_at')->nullable();
            $table->string('employee_id', 64)->nullable()->unique();
            $table->foreign('employee_id')->references('id')->on('employees')->restrictOnDelete();
            $table->string('phone', 50)->nullable();
            $table->string('address', 500)->nullable();
            $table->boolean('notifications_enabled')->default(true);
        });
        Schema::create('property_favorites', function (Blueprint $table): void {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('property_id', 64);
            $table->primary(['user_id', 'property_id']);
        });
        Schema::create('property_notification_reads', function (Blueprint $table): void {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('notification_id', 64);
            $table->foreign('notification_id')->references('id')->on('property_notifications')->cascadeOnDelete();
            $table->primary(['user_id', 'notification_id']);
        });
        Schema::create('property_attachments', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('resource', 32);
            $table->string('record_id', 64);
            $table->string('field', 32);
            $table->string('mime', 64);
            $table->longText('content');
            $table->unique(['resource', 'record_id', 'field'], 'property_attachment_record_unique');
        });
        Schema::create('property_revisions', function (Blueprint $table): void {
            $table->unsignedTinyInteger('id')->primary();
            $table->unsignedBigInteger('version');
        });
        DB::table('property_revisions')->insert(['id' => 1, 'version' => 0]);
    }

    public function down(): void
    {
        foreach (['property_revisions', 'property_attachments', 'property_notification_reads', 'property_favorites'] as $table) {
            Schema::dropIfExists($table);
        }
        Schema::table('users', function (Blueprint $table): void {
            $table->dropForeign(['employee_id']);
            $table->dropColumn(['role', 'active', 'archived_at', 'employee_id', 'phone', 'address', 'notifications_enabled']);
        });
        foreach (array_reverse(self::TABLES) as $table) {
            Schema::dropIfExists($table);
        }
    }
};
