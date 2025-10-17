@extends('layouts.admin')

@section('content')
    <div class="container mt-4">
        <h1 class="mb-4">Додати категорію</h1>

        {{-- Повідомлення про помилки --}}
        @if ($errors->any())
            <div class="alert alert-danger">
                <ul class="mb-0">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form action="{{ route('admin.categories.store') }}" method="POST">
            @csrf

            <div class="mb-3">
                <label for="name" class="form-label">Назва категорії</label>
                <input type="text" name="name" id="name"
                       class="form-control" value="{{ old('name') }}" required>
            </div>

            <div class="mb-3">
                <label for="slug" class="form-label">Slug (URL-ключ)</label>
                <input type="text" name="slug" id="slug"
                       class="form-control" value="{{ old('slug') }}" required>
                <div class="form-text">
                    Наприклад: <code>hair-products</code> або <code>styling-tools</code>
                </div>
            </div>

            <button type="submit" class="btn btn-success">💾 Зберегти</button>
            <a href="{{ route('admin.categories.index') }}" class="btn btn-secondary">⬅ Назад</a>
        </form>
    </div>
@endsection
