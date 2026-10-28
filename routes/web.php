<?php

use App\Http\Controllers\CompanyController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NoteController;
use App\Http\Controllers\OpportunityController;
use App\Http\Controllers\SearchController;
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

// Notes
Route::resource('notes', NoteController::class)->only(['store', 'update', 'destroy']);

// Global Search API for Command Palette (Ctrl+K)
Route::get('api/search', [SearchController::class, 'search'])->name('search');
