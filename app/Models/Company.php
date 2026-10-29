<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'partner_type',
        'tax_number',
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

    /**
     * Freight-X Relationships
     */
    public function shipmentsAsCustomer(): HasMany
    {
        return $this->hasMany(Shipment::class, 'customer_id');
    }

    public function shipmentsAsShipper(): HasMany
    {
        return $this->hasMany(Shipment::class, 'shipper_id');
    }

    public function shipmentsAsConsignee(): HasMany
    {
        return $this->hasMany(Shipment::class, 'consignee_id');
    }

    public function shipmentsAsCarrier(): HasMany
    {
        return $this->hasMany(Shipment::class, 'carrier_id');
    }

    public function vessels(): HasMany
    {
        return $this->hasMany(Vessel::class, 'carrier_id');
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class, 'partner_id');
    }
}
