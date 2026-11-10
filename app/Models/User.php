<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

#[Fillable(['name', 'email', 'phone', 'password', 'consent_at', 'consent_version', 'last_login_at', 'deletion_requested_at', 'is_demo', 'demo_expires_at'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * @return HasOne<Business, $this>
     */
    public function business(): HasOne
    {
        return $this->hasOne(Business::class);
    }

    /**
     * @return HasOne<BusinessProfile, $this>
     */
    public function businessProfile(): HasOne
    {
        return $this->hasOne(BusinessProfile::class);
    }

    /**
     * @return HasOne<UserPreference, $this>
     */
    public function preference(): HasOne
    {
        return $this->hasOne(UserPreference::class);
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
            'two_factor_confirmed_at' => 'datetime',
            'consent_at' => 'datetime',
            'last_login_at' => 'datetime',
            'deletion_requested_at' => 'datetime',
            'is_demo' => 'boolean',
            'demo_expires_at' => 'datetime',
        ];
    }
}
