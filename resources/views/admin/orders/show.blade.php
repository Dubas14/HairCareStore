@extends('layouts.app')

@section('content')
    <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h1>Замовлення #{{ $order->id }}</h1>
            <a href="{{ route('admin.orders.index') }}" class="btn btn-secondary">Назад до списку</a>
        </div>

        <div class="row">
            <div class="col-md-8">
                <h4>Товари в замовленні</h4>
                <table class="table">
                    <thead>
                    <tr>
                        <th>Товар</th>
                        <th>Ціна за од.</th>
                        <th>Кількість</th>
                        <th>Разом</th>
                    </tr>
                    </thead>
                    <tbody>
                    @foreach($order->products as $product)
                        <tr>
                            <td>{{ $product->name }}</td>
                            <td>{{ $product->pivot->price }} грн</td>
                            <td>{{ $product->pivot->quantity }}</td>
                            <td>{{ $product->pivot->price * $product->pivot->quantity }} грн</td>
                        </tr>
                    @endforeach
                    </tbody>
                </table>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Інформація про клієнта</h5>
                        <p><strong>Ім'я:</strong> {{ $order->customer_name }}</p>
                        <p><strong>Телефон:</strong> {{ $order->customer_phone }}</p>
                        <p><strong>Адреса:</strong> {{ $order->customer_address }}</p>
                        <hr>
                        <h5 class="card-title">Статус замовлення</h5>
                        <form action="{{ route('admin.orders.updateStatus', $order) }}" method="POST">
                            @csrf
                            <div class="input-group">
                                <select name="status" class="form-select">
                                    <option value="В обробці" @if($order->status == 'В обробці') selected @endif>В обробці</option>
                                    <option value="Відправлено" @if($order->status == 'Відправлено') selected @endif>Відправлено</option>
                                    <option value="Завершено" @if($order->status == 'Завершено') selected @endif>Завершено</option>
                                    <option value="Скасовано" @if($order->status == 'Скасовано') selected @endif>Скасовано</option>
                                </select>
                                <button type="submit" class="btn btn-primary">Оновити</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection
