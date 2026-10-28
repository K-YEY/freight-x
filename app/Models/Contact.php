<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contact extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'job_title',
        'city',
        'avatar_url',
        'company_id',
        'status',
        'tags',
        'linkedin_url',
    ];

    protected $casts = [
        'tags' => 'array',
    ];

    protected $appends = ['name'];

    public function name(): Attribute
    {
        return Attribute::make(
            get: fn () => trim("{$this->first_name} {$this->last_name}"),
        );
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
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
