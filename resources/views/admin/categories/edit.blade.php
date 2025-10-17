@extends('layouts.app')

@section('content')
    <div class="container">
        <h1>Редагування категорії: {{ $category->name }}</h1>

        @if ($errors->any())
            <div class="alert alert-danger">
                <ul class="mb-0">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        {{-- Ключові відмінності від форми створення --}}
        <form action="{{ route('admin.categories.update', $category) }}" method="POST">
            @csrf
            @method('PUT') {{-- Вказуємо, що це метод оновлення (Update) --}}

            <div class="mb-3">
                <label for="name" class="form-label">Назва категорії</label>
                {{-- Заповнюємо поле поточним значенням з моделі --}}
                <input type="text" class="form-control" id="name" name="name" value="{{ old('name', $category->name) }}" required>
            </div>

            <div class="mb-3">
                <label for="slug" class="form-label">Slug (URL)</label>
                <input type="text" class="form-control" id="slug" name="slug" value="{{ old('slug', $category->slug) }}" required>
                <div class="form-text">Використовуйте латинські літери, цифри, дефіси та підкреслення.</div>
            </div>

            <button type="submit" class="btn btn-primary">Оновити</button>
            <a href="{{ route('admin.categories.index') }}" class="btn btn-secondary">Скасувати</a>
        </form>
    </div>
@endsection
