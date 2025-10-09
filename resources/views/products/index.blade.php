@extends('layouts.app')

@section('content')
    {{-- Додаємо заголовок сторінки --}}
    <div class="row mb-4">
        <div class="col-12">
            <h1 class="display-6">Каталог товарів</h1>
        </div>
    </div>

    {{-- Огортаємо всі товари в один .row --}}
    <div class="row">
        @forelse($products as $product)
            {{-- Кожен товар - це колонка. 'col-md-4' означає 3 колонки на середніх екранах і більше --}}
            <div class="col-md-4 mb-4">
                {{-- Використовуємо компонент .card. Клас h-100 робить усі картки в ряду однакової висоти --}}
                <div class="card h-100">
                    <img src="{{ $product->image }}" class="card-img-top" alt="{{ $product->name }}">
                    {{-- .card-body для основного контенту --}}
                    <div class="card-body d-flex flex-column">
                        {{-- Додаємо назву категорії, якщо вона є --}}
                        @if($product->category)
                            <p class="card-text"><small class="text-muted">{{ $product->category->name }}</small></p>
                        @endif
                        <h5 class="card-title">{{ $product->name }}</h5>
                        <p class="card-text">{{ Str::limit($product->description, 80) }}</p>
                        <p class="card-text fs-5"><strong>{{ $product->price }} грн</strong></p>

                        {{-- Цей блок з .mt-auto "притисне" кнопку до низу картки --}}
                        <div class="mt-auto">
                            <form action="{{ route('cart.add', $product) }}" method="POST" class="d-grid">
                                @csrf
                                <button type="submit" class="btn btn-primary">Додати в кошик</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        @empty
            {{-- Показуємо повідомлення, якщо товарів немає --}}
            <div class="col-12">
                <p>На жаль, наразі немає доступних товарів.</p>
            </div>
        @endforelse
    </div>
@endsection
