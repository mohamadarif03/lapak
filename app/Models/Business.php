<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Business extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'owner_name',
        'business_name',
        'business_type',
        'address',
        'lat',
        'lng',
        'analysis_viewed_at',
        'main_products',
        'price_range',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'analysis_viewed_at' => 'datetime',
            'lat' => 'float',
            'lng' => 'float',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<Transaction, $this>
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * @return HasMany<Insight, $this>
     */
    public function insights(): HasMany
    {
        return $this->hasMany(Insight::class);
    }

    /**
     * @return HasMany<Campaign, $this>
     */
    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class);
    }

    /**
     * @return HasMany<SocialConnection, $this>
     */
    public function socialConnections(): HasMany
    {
        return $this->hasMany(SocialConnection::class);
    }
}
