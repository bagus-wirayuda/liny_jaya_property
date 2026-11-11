<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'phone', 'address'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * @return BelongsTo<Employee, $this>
     */
    public function employeeProfile(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }

    /**
     * @return HasMany<Booking, $this>
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'client_id');
    }

    /**
     * @return HasMany<Ticket, $this>
     */
    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'client_id');
    }

    /**
     * @return HasMany<PropertyNotification, $this>
     */
    public function workspaceNotifications(): HasMany
    {
        return $this->hasMany(PropertyNotification::class, 'client_id');
    }

    /**
     * @return HasMany<Message, $this>
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'author_id');
    }

    /**
     * @return HasMany<PropertyAudit, $this>
     */
    public function audits(): HasMany
    {
        return $this->hasMany(PropertyAudit::class, 'author_id');
    }

    /**
     * @return BelongsToMany<PropertyNotification, $this>
     */
    public function readNotifications(): BelongsToMany
    {
        return $this->belongsToMany(PropertyNotification::class, 'property_notification_reads', 'user_id', 'notification_id');
    }

    /**
     * @return HasMany<PropertyFavorite, $this>
     */
    public function favorites(): HasMany
    {
        return $this->hasMany(PropertyFavorite::class, 'user_id');
    }

    /**
     * Determine whether this user can access a given workspace role.
     */
    public function canAccessWorkspaceRole(string $role): bool
    {
        return $this->active
            && $this->archived_at === null
            && $this->role === $role
            && ($role !== 'employee' || (bool) $this->employee_id);
    }

    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query->where('active', true)->whereNull('archived_at');
    }

    #[Scope]
    protected function clients(Builder $query): Builder
    {
        return $query->where('role', 'client')->whereNull('archived_at');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'active' => 'boolean',
            'archived_at' => 'datetime',
            'notifications_enabled' => 'boolean',
        ];
    }
}
