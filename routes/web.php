<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeTransactionController;
use App\Http\Controllers\ExchangeRateController;
use App\Http\Controllers\MasterDataController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\OfficeExpenseController;
use App\Http\Controllers\OpportunityController;
use App\Http\Controllers\QuotationController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ShipmentController;
use App\Http\Controllers\ShipmentDocumentController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\TruckDispatchController;
use Illuminate\Support\Facades\Route;

// Authentication (Login Only - No Public Registration)
Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});

Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
    ->name('logout')
    ->middleware('auth');

// Protected ERP / Freight-X System Routes
Route::middleware(['auth'])->group(function () {

    // Dashboard
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Staff & Employees (الموظفين)
    Route::resource('employees', EmployeeController::class)->only(['index', 'store', 'update', 'destroy']);

    // Employee Accounts & Payroll Ledger (حسابات الموظفين وسجل الرواتب والمستحقات)
    Route::get('employee-accounts', [EmployeeTransactionController::class, 'index'])->name('employee-accounts.index');
    Route::post('employee-accounts', [EmployeeTransactionController::class, 'store'])->name('employee-accounts.store');
    Route::post('employee-accounts/payroll', [EmployeeTransactionController::class, 'generateMonthlyPayroll'])->name('employee-accounts.payroll');
    Route::delete('employee-accounts/{transaction}', [EmployeeTransactionController::class, 'destroy'])->name('employee-accounts.destroy');

    // Office & General Expenses (مصاريف المكتب والمصروفات الإدارية)
    Route::resource('office-expenses', OfficeExpenseController::class)->only(['index', 'store', 'update', 'destroy']);

    // Quotations (Freight Rate Inquiries & Conversion to Shipment)
    Route::resource('quotations', QuotationController::class)->only(['index', 'store', 'update', 'destroy']);
    Route::patch('quotations/{quotation}/status', [QuotationController::class, 'updateStatus'])->name('quotations.status');
    Route::post('quotations/{quotation}/convert', [QuotationController::class, 'convert'])->name('quotations.convert');

    // Contacts (People / Customers)
    Route::resource('contacts', ContactController::class)->only(['index', 'store', 'update', 'destroy']);

    // Companies (Carriers & Logistics Partners)
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
    Route::patch('shipments/{shipment}/bl', [ShipmentController::class, 'updateBl'])->name('shipments.bl.update');
    Route::patch('shipments/{shipment}/freetime', [ShipmentController::class, 'updateFreeTime'])->name('shipments.freetime');
    Route::patch('shipments/{shipment}/customs', [ShipmentController::class, 'updateCustoms'])->name('shipments.customs');
    Route::patch('shipments/{shipment}/agent-settlement', [ShipmentController::class, 'updateAgentSettlement'])->name('shipments.agent-settlement');
    Route::patch('shipments/{shipment}/financial-lock', [ShipmentController::class, 'toggleFinancialLock'])->name('shipments.financial-lock');
    Route::get('shipments/{shipment}/hbl', [ShipmentController::class, 'billOfLading'])->name('shipments.hbl');
    Route::get('shipments/{shipment}/agent-note', [ShipmentController::class, 'agentDebitNote'])->name('shipments.agent-note');
    Route::patch('milestones/{milestone}', [ShipmentController::class, 'updateMilestone'])->name('milestones.update');
    Route::post('shipments/{shipment}/containers', [ShipmentController::class, 'storeContainer'])->name('shipments.containers.store');
    Route::patch('containers/{container}/tracking', [ShipmentController::class, 'updateContainerTracking'])->name('containers.tracking');
    Route::delete('containers/{container}', [ShipmentController::class, 'destroyContainer'])->name('shipments.containers.destroy');

    // Inland Drayage & Truck Dispatch Orders
    Route::post('shipments/{shipment}/dispatches', [TruckDispatchController::class, 'store'])->name('shipments.dispatches.store');
    Route::patch('dispatches/{dispatch}/status', [TruckDispatchController::class, 'updateStatus'])->name('dispatches.status');
    Route::delete('dispatches/{dispatch}', [TruckDispatchController::class, 'destroy'])->name('dispatches.destroy');
    Route::get('dispatches/{dispatch}/slip', [TruckDispatchController::class, 'printSlip'])->name('dispatches.slip');

    Route::post('shipments/{shipment}/invoices', [ShipmentController::class, 'storeInvoice'])->name('shipments.invoices.store');
    Route::patch('invoices/{invoice}/status', [ShipmentController::class, 'updateInvoiceStatus'])->name('invoices.status');

    // Shipment Documents (e-Docs Checklist & Digital Archive)
    Route::post('shipments/{shipment}/documents', [ShipmentDocumentController::class, 'store'])->name('shipments.documents.store');
    Route::patch('documents/{document}/verify', [ShipmentDocumentController::class, 'verify'])->name('documents.verify');
    Route::get('documents/{document}/download', [ShipmentDocumentController::class, 'download'])->name('documents.download');
    Route::delete('documents/{document}', [ShipmentDocumentController::class, 'destroy'])->name('documents.destroy');

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

    // Live Multi-Currency & Exchange Rates
    Route::get('api/exchange-rates', [ExchangeRateController::class, 'index'])->name('exchange-rates.index');
    Route::post('api/exchange-rates', [ExchangeRateController::class, 'store'])->name('exchange-rates.store');
    Route::post('api/exchange-rates/refresh', [ExchangeRateController::class, 'refresh'])->name('exchange-rates.refresh');
    Route::post('api/exchange-rates/update', [ExchangeRateController::class, 'update'])->name('exchange-rates.update');
    Route::delete('api/exchange-rates/{code}', [ExchangeRateController::class, 'destroy'])->name('exchange-rates.destroy');
    Route::get('api/exchange-rates/convert', [ExchangeRateController::class, 'convert'])->name('exchange-rates.convert');
});
