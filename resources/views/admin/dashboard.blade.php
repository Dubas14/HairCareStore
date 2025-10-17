@extends('layouts.admin')

@section('title', 'Головна панель')

@section('content')
    <div class="row">
        <div class="col-md-4">
            <div class="card text-center mb-3">
                <div class="card-body">
                    <i class="bi bi-box-seam fs-1"></i>
                    <h5 class="card-title mt-3">Управління замовленнями</h5>
                    <p class="card-text">Перегляд та оновлення статусу замовлень.</p>
                    <a href="{{ route('admin.orders.index') }}" class="btn btn-primary">Перейти</a>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card text-center mb-3">
                <div class="card-body">
                    <i class="bi bi-box fs-1"></i>
                    <h5 class="card-title mt-3">Управління товарами</h5>
                    <p class="card-text">Додавання, редагування та видалення товарів.</p>
                    <a href="{{ route('admin.products.index') }}" class="btn btn-primary">Перейти</a>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card text-center mb-3">
                <div class="card-body">
                    <i class="bi bi-tags fs-1"></i>
                    <h5 class="card-title mt-3">Управління категоріями</h5>
                    <p class="card-text">Керування категоріями товарів.</p>
                    <a href="{{ route('admin.categories.index') }}" class="btn btn-primary">Перейти</a>
                </div>
            </div>
        </div>
    </div>
@endsection
