<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $phone
 * @property string $code_hash
 * @property string $channel
 * @property Carbon $expires_at
 * @property int $attempts
 * @property Carbon|null $consumed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class OtpCode extends Model
{
    use HasFactory;

    protected $fillable = [
        'phone',
        'code_hash',
        'channel',
        'purpose',
        'expires_at',
        'attempts',
        'consumed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'consumed_at' => 'datetime',
            'attempts' => 'integer',
        ];
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isConsumed(): bool
    {
        return $this->consumed_at !== null;
    }
}
