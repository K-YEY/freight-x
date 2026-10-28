<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'domain',
        'website_url',
        'industry',
        'employees_count',
        'annual_revenue',
        'city',
        'country',
        'address',
        'linkedin_url',
        'logo_url',
        'description',
    ];

    protected $casts = [
        'annual_revenue' => 'decimal:2',
        'employees_count' => 'integer',
    ];

    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }

    public function opportunities(): HasMany
    {
        return $this->hasMany(Opportunity::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(Note::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }
}
