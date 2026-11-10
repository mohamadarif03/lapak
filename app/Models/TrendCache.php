<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrendCache extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'payload',
        'source',
        'fetched_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'fetched_at' => 'datetime',
        ];
    }
}
