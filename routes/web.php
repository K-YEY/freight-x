<?php

use App\Http\Controllers\BillingController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\OpportunityController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\TaskController;
use Illuminate\Support\Facades\Route;

// Dashboard
Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/dashboard', [DashboardController::class, 'index']);

// Contacts (People)
Route::resource('contacts', ContactController::class)->only(['index', 'store', 'update', 'destroy']);

// Companies
Route::resource('companies', CompanyController::class)->only(['index', 'store', 'update', 'destroy']);

// Opportunities (Deals & Pipeline)
Route::resource('opportunities', OpportunityController::class)->only(['index', 'store', 'update', 'destroy']);
Route::patch('opportunities/{opportunity}/stage', [OpportunityController::class, 'updateStage'])->name('opportunities.stage');

// Tasks
Route::resource('tasks', TaskController::class)->only(['index', 'store', 'update', 'destroy']);
Route::patch('tasks/{task}/toggle', [TaskController::class, 'toggle'])->name('tasks.toggle');

// Shipments (Freight Operations & Multimodal Tracking)
Route::resource('shipments', ShipmentController::class)->only(['index', 'store', 'update', 'destroy']);
Route::patch('shipments/{shipment}/status', [ShipmentController::class, 'updateStatus'])->name('shipments.status');
Route::patch('milestones/{milestone}', [ShipmentController::class, 'updateMilestone'])->name('milestones.update');
Route::post('shipments/{shipment}/containers', [ShipmentController::class, 'storeContainer'])->name('shipments.containers.store');
Route::delete('containers/{container}', [ShipmentController::class, 'destroyContainer'])->name('shipments.containers.destroy');
Route::post('shipments/{shipment}/invoices', [ShipmentController::class, 'storeInvoice'])->name('shipments.invoices.store');
Route::patch('invoices/{invoice}/status', [ShipmentController::class, 'updateInvoiceStatus'])->name('invoices.status');

// Master Data (Ports, Warehouses, Vessels, Incoterms, Packages, Move Types)
Route::get('master-data', [MasterDataController::class, 'index'])->name('master-data.index');
Route::post('master-data/ports', [MasterDataController::class, 'storePort'])->name('master-data.ports.store');
Route::patch('master-data/ports/{port}', [MasterDataController::class, 'updatePort'])->name('master-data.ports.update');
Route::delete('master-data/ports/{port}', [MasterDataController::class, 'destroyPort'])->name('master-data.ports.destroy');

Route::post('master-data/warehouses', [MasterDataController::class, 'storeWarehouse'])->name('master-data.warehouses.store');
Route::patch('master-data/warehouses/{warehouse}', [MasterDataController::class, 'updateWarehouse'])->name('master-data.warehouses.update');
Route::delete('master-data/warehouses/{warehouse}', [MasterDataController::class, 'destroyWarehouse'])->name('master-data.warehouses.destroy');

Route::post('master-data/vessels', [MasterDataController::class, 'storeVessel'])->name('master-data.vessels.store');
Route::patch('master-data/vessels/{vessel}', [MasterDataController::class, 'updateVessel'])->name('master-data.vessels.update');
Route::delete('master-data/vessels/{vessel}', [MasterDataController::class, 'destroyVessel'])->name('master-data.vessels.destroy');

Route::post('master-data/incoterms', [MasterDataController::class, 'storeIncoterm'])->name('master-data.incoterms.store');
Route::patch('master-data/incoterms/{incoterm}', [MasterDataController::class, 'updateIncoterm'])->name('master-data.incoterms.update');
Route::delete('master-data/incoterms/{incoterm}', [MasterDataController::class, 'destroyIncoterm'])->name('master-data.incoterms.destroy');

Route::post('master-data/packages', [MasterDataController::class, 'storePackageType'])->name('master-data.packages.store');
Route::patch('master-data/packages/{packageType}', [MasterDataController::class, 'updatePackageType'])->name('master-data.packages.update');
Route::delete('master-data/packages/{packageType}', [MasterDataController::class, 'destroyPackageType'])->name('master-data.packages.destroy');

Route::post('master-data/move-types', [MasterDataController::class, 'storeMoveType'])->name('master-data.move-types.store');
Route::patch('master-data/move-types/{moveType}', [MasterDataController::class, 'updateMoveType'])->name('master-data.move-types.update');
Route::delete('master-data/move-types/{moveType}', [MasterDataController::class, 'destroyMoveType'])->name('master-data.move-types.destroy');

// Invoices & Billing
Route::get('billing', [BillingController::class, 'index'])->name('billing.index');
Route::post('billing', [BillingController::class, 'store'])->name('billing.store');
Route::patch('billing/{invoice}/payment', [BillingController::class, 'recordPayment'])->name('billing.payment');
Route::patch('billing/{invoice}/status', [BillingController::class, 'updateStatus'])->name('billing.status');
Route::delete('billing/{invoice}', [BillingController::class, 'destroy'])->name('billing.destroy');

// Notes
Route::resource('notes', NoteController::class)->only(['store', 'update', 'destroy']);

// Global Search API for Command Palette (Ctrl+K)
Route::get('api/search', [SearchController::class, 'search'])->name('search');
