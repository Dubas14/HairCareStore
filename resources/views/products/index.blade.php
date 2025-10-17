@extends('layouts.app')

@section('content')
    <div class="row">
        {{-- SIDEBAR WITH CATEGORIES --}}
        <div class="col-md-3">
            <h4 class="mb-3">Категорії</h4>
            <ul class="list-group">
                <a href="{{ route('products.index') }}" class="list-group-item list-group-item-action {{ !$category ? 'active' : '' }}">
                    Всі товари
                </a>
                @foreach ($categories as $cat)
                    <a href="{{ route('products.by_category', $cat) }}"
                       class="list-group-item list-group-item-action {{ ($category && $category->id == $cat->id) ? 'active' : '' }}">
                        {{ $cat->name }}
                    </a>
                @endforeach
            </ul>
        </div>

        {{-- MAIN CONTENT WITH PRODUCTS --}}
        <div class="col-md-9">
            <div class="row mb-4">
                <div class="col-12">
                    <h1 class="display-6">Каталог товарів</h1>
                </div>
            </div>

            <div class="row">
                @forelse($products as $product)
                    {{-- Each product is a column. 'col-lg-4' means 3 columns on large screens --}}
                    <div class="col-lg-4 col-md-6 mb-4">
                        {{-- The h-100 class makes all cards in a row the same height --}}
                        <div class="card h-100">
                            {{-- The 'product-card-image' class is for uniform image sizing from custom.css --}}
                            @if($product->image)
                                <img src="{{ asset('storage/' . $product->image) }}" class="card-img-top " alt="{{ $product->name }}">
                            @else
                                <img src="https://via.placeholder.com/300x250" class="card-img-top" alt="No image">
                            @endif

                            {{-- 'd-flex flex-column' allows for vertical alignment --}}
                            <div class="card-body d-flex flex-column">
                                @if($product->category)
                                    <p class="card-text"><small class="text-muted">{{ $product->category->name }}</small></p>
                                @endif
                                <h5 class="card-title">{{ $product->name }}</h5>
                                <p class="card-text">{{ Str::limit($product->description, 80) }}</p>
                                <p class="card-text fs-5"><strong>{{ $product->price }} грн</strong></p>

                                {{-- This 'mt-auto' block pushes the button to the bottom of the card --}}
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
                    <div class="col-12">
                        <p>На жаль, наразі немає доступних товарів.</p>
                    </div>
                @endforelse
            </div>

            {{-- Pagination links --}}
            <div class="mt-4">
                {{ $products->links() }}
            </div>
        </div>
    </div>
@endsection
