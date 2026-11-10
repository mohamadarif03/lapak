<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GeoCache extends Model
{
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'key',
        'payload',
        'source',
        'data_date',
        'fetched_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'data_date' => 'date',
            'fetched_at' => 'datetime',
        ];
    }
}
