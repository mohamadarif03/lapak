<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Campaign extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'business_id',
        'insight_id',
        'title',
        'promo_name',
        'offer_details',
        'valid_period',
        'contact',
        'style',
        'color_scheme',
        'format',
        'copy',
        'poster_path',
        'generated_by',
        'status',
        'approved_at',
        'posted_at',
        'post_platform',
        'post_external_id',
        'idempotency_key',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'copy' => 'array',
            'approved_at' => 'datetime',
            'posted_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Business, $this>
     */
    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    /**
     * @return BelongsTo<Insight, $this>
     */
    public function insight(): BelongsTo
    {
        return $this->belongsTo(Insight::class);
    }

    /**
     * @return HasMany<CampaignVersion, $this>
     */
    public function versions(): HasMany
    {
        return $this->hasMany(CampaignVersion::class);
    }
}
