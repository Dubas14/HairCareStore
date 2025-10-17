@extends('layouts.admin')

@section('title', 'Редагування товару: ' . $product->name)

@section('content')
    {{-- Відображення помилок валідації, якщо вони є --}}
    @if ($errors->any())
        <div class="alert alert-danger">
            <ul class="mb-0">
                @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    <form action="{{ route('admin.products.update', $product) }}" method="POST" enctype="multipart/form-data">
        @csrf
        @method('PUT') {{-- Вказуємо, що це метод оновлення --}}

        <div class="row">
            {{-- ЛІВА КОЛОНКА: Основна інформація --}}
            <div class="col-md-8">
                <div class="card card-body mb-3">
                    <div class="mb-3">
                        <label for="name" class="form-label">Назва товару</label>
                        <input type="text" class="form-control" id="name" name="name" value="{{ old('name', $product->name) }}" required>
                    </div>

                    <div class="mb-3">
                        <label for="description" class="form-label">Повний опис товару</label>
                        {{-- Замінюємо звичайне текстове поле на редактор --}}
                        <textarea class="form-control" id="description" name="description" rows="10">{{ old('description', $product->description) }}</textarea>
                    </div>
                </div>
            </div>

            {{-- ПРАВА КОЛОНКА: Ціна, категорія, зображення --}}
            <div class="col-md-4">
                <div class="card card-body">
                    <div class="mb-3">
                        <label for="price" class="form-label">Ціна</label>
                        <input type="number" step="0.01" class="form-control" id="price" name="price" value="{{ old('price', $product->price) }}" required>
                    </div>

                    <div class="mb-3">
                        <label for="category_id" class="form-label">Категорія</label>
                        <select class="form-select" id="category_id" name="category_id" required>
                            @foreach ($categories as $category)
                                <option value="{{ $category->id }}" {{ old('category_id', $product->category_id) == $category->id ? 'selected' : '' }}>
                                    {{ $category->name }}
                                </option>
                            @endforeach
                        </select>
                    </div>

                    <div class="mb-3">
                        <label for="image" class="form-label">Змінити зображення</label>
                        <input class="form-control" type="file" id="image" name="image">
                        @if($product->image)
                            <div class="mt-2">
                                <p class="mb-1"><small>Поточне зображення:</small></p>
                                <img src="{{ asset('storage/' . $product->image) }}" alt="{{ $product->name }}" class="img-fluid rounded">
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-4">
            <button type="submit" class="btn btn-primary">Оновити товар</button>
            <a href="{{ route('admin.products.index') }}" class="btn btn-secondary">Скасувати</a>
        </div>
    </form>

    {{-- СКРИПТ ІНІЦІАЛІЗАЦІЇ РЕДАКТОРА --}}
    <script>
        tinymce.init({
            selector: 'textarea#description', // прив'язка до нашого поля за ID
            plugins: 'code table lists image link',
            toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | indent outdent | bullist numlist | code | table | link image'
        });
    </script>
@endsection
