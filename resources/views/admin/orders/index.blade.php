@extends('layouts.app') {{-- Можна створити окремий layout для адмінки, але для простоти використаємо існуючий --}}

@section('content')
    <div class="container">
        <h1>Управління замовленнями</h1>
        <table class="table table-striped">
            <thead>
            <tr>
                <th>ID</th>
                <th>Ім'я клієнта</th>
                <th>Телефон</th>
                <th>Загальна сума</th>
                <th>Статус</th>
                <th>Дата</th>
                <th>Дії</th>
            </tr>
            </thead>
            <tbody>
            @forelse ($orders as $order)
                <tr>
                    <td>{{ $order->id }}</td>
                    <td>{{ $order->customer_name }}</td>
                    <td>{{ $order->customer_phone }}</td>
                    <td>{{ $order->total_price }} грн</td>
                    <td><span class="badge bg-info">{{ $order->status }}</span></td>
                    <td>{{ $order->created_at->format('d.m.Y H:i') }}</td>
                    <td>
                        <a href="{{ route('admin.orders.show', $order) }}" class="btn btn-primary btn-sm">Деталі</a>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" class="text-center">Замовлень ще немає.</td>
                </tr>
            @endforelse
            </tbody>
        </table>
        {{ $orders->links() }} {{-- Пагінація --}}
    </div>
@endsection
