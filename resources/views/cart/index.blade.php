@extends('layouts.app')

@section('content')
    <h1 class="mb-4">Ваш кошик</h1>

    @if(!empty($cart))
        <div class="row">
            {{-- КОЛОНКА З ТОВАРАМИ --}}
            <div class="col-lg-8">
                <table class="table align-middle">
                    <thead>
                    <tr>
                        <th style="width: 120px;">Зображення</th>
                        <th>Назва</th>
                        <th>Ціна</th>
                        <th>Кількість</th>
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    @foreach($cart as $id => $details)
                        <tr>
                            <td><img src="{{ $details['image'] }}" class="img-fluid rounded" alt="{{ $details['name'] }}"></td>
                            <td>{{ $details['name'] }}</td>
                            <td>{{ $details['price'] }} грн</td>
                            <td>{{ $details['quantity'] }}</td>
                            <td>
                                <form action="{{ route('cart.remove', $id) }}" method="POST">
                                    @csrf
                                    <button type="submit" class="btn btn-danger btn-sm">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </form>
                            </td>
                        </tr>
                    @endforeach
                    </tbody>
                </table>
            </div>

            {{-- КОЛОНКА З ФОРМОЮ ЗАМОВЛЕННЯ --}}
            <div class="col-lg-4">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title fs-4">Разом до сплати</h5>
                        <p class="card-text display-6"><strong>{{ $total }} грн</strong></p>
                        <hr>

                        @auth
                            <h5 class="card-title mb-3">Оформлення замовлення</h5>
                            <form action="{{ route('checkout.store') }}" method="POST">
                                @csrf
                                <div class="mb-3">
                                    <label for="name" class="form-label">Ваше ім'я</label>
                                    <input type="text" class="form-control" id="name" name="name" value="{{ auth()->user()->name }}" required>
                                </div>
                                <div class="mb-3">
                                    <label for="phone" class="form-label">Номер телефону</label>
                                    <input type="tel" class="form-control" id="phone" name="phone" placeholder="+380" required>
                                </div>
                                <div class="mb-3">
                                    <label for="address" class="form-label">Адреса доставки</label>
                                    <textarea class="form-control" id="address" name="address" rows="3" placeholder="Місто, відділення Нової Пошти" required></textarea>
                                </div>
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-primary btn-lg">Оформити замовлення</button>
                                </div>
                            </form>
                        @else
                            <div class="alert alert-info">
                                <p class="mb-0">Будь ласка, <a href="{{ route('login') }}" class="alert-link">увійдіть</a> або <a href="{{ route('register') }}" class="alert-link">зареєструйтесь</a>, щоб оформити замовлення.</p>
                            </div>
                        @endauth
                    </div>
                </div>
            </div>
        </div>
    @else
        <div class="text-center py-5">
            <p class="fs-4">Ваш кошик порожній.</p>
            <a href="{{ route('products.index') }}" class="btn btn-primary">Перейти до покупок</a>
        </div>
    @endif
@endsection
