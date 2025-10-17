<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>@yield('title', config('app.name', 'Laravel'))</title>
    <meta name="description" content="@yield('description', 'Ваш найкращий магазин догляду за волоссям.')">

    @vite(['resources/js/app.js']) {{-- Vite сам підключає CSS --}}

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="{{ asset('css/custom.css') }}">
</head>
<body>
<div id="app">
    {{-- ОНОВЛЕНИЙ "ПРИЛИПАЮЧИЙ" ХЕДЕР --}}
    <header class="navbar navbar-expand-md navbar-light bg-white shadow-sm sticky-top">
        <div class="container">
            <a class="navbar-brand fs-4" href="{{ route('products.index') }}">
                ✨ **HairCare Store**
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="{{ __('Toggle navigation') }}">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto">
                    {{-- Майбутні посилання, напр: <li class="nav-item"><a class="nav-link" href="#">Про нас</a></li> --}}
                </ul>

                <ul class="navbar-nav ms-auto align-items-center">
                    @auth
                        @if(Auth::user()->is_admin)
                            <li class="nav-item">
                                <a class="nav-link" href="{{ route('admin.dashboard') }}" title="Адмін-панель">
                                    <i class="bi bi-shield-lock-fill"></i>
                                    <span class="d-md-none ms-1">Адмін-панель</span>
                                </a>
                            </li>
                        @endif
                    @endauth
                    <li class="nav-item">
                        <a class="nav-link fs-5 position-relative" href="{{ route('cart.index') }}" title="Кошик">
                            <i class="bi bi-cart3"></i>
                            @if(count((array) session('cart')) > 0)
                                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 0.6em;">
                                    {{ count((array) session('cart')) }}
                                    <span class="visually-hidden">товарів у кошику</span>
                                </span>
                            @endif
                        </a>
                    </li>
                    @guest
                        @if (Route::has('login'))
                            <li class="nav-item">
                                <a class="nav-link" href="{{ route('login') }}">{{ __('Login') }}</a>
                            </li>
                        @endif
                        @if (Route::has('register'))
                            <li class="nav-item">
                                <a class="btn btn-primary btn-sm ms-2" href="{{ route('register') }}">{{ __('Register') }}</a>
                            </li>
                        @endif
                    @else
                        <li class="nav-item dropdown">
                            <a id="navbarDropdown" class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" v-pre>
                                {{ Auth::user()->name }}
                            </a>
                            <div class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                                <a class="dropdown-item" href="{{ route('logout') }}"
                                   onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
                                    {{ __('Logout') }}
                                </a>
                                <form id="logout-form" action="{{ route('logout') }}" method="POST" class="d-none">@csrf</form>
                            </div>
                        </li>
                    @endguest
                </ul>
            </div>
        </div>
    </header>

    {{-- ДИНАМІЧНА HERO-СЕКЦІЯ (для банерів/слайдерів на головній) --}}
    @yield('hero')

    <main class="py-4 py-md-5">
        <div class="container">
            {{-- Оновлені повідомлення, які можна закрити --}}
            @if(session('success'))
                <div class="alert alert-success alert-dismissible fade show" role="alert">
                    {{ session('success') }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            @endif
            @if(session('error'))
                <div class="alert alert-danger alert-dismissible fade show" role="alert">
                    {{ session('error') }}
                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            @endif
            @yield('content')
        </div>
    </main>
</div>

{{-- ДИНАМІЧНА КНОПКА "НАГОРУ" --}}
<button onclick="scrollToTop()" id="backToTopBtn" title="Повернутись нагору">
    <i class="bi bi-arrow-up"></i>
</button>

{{-- РОЗШИРЕНИЙ ФУТЕР --}}
<footer class="footer mt-auto py-4 bg-light">
    <div class="container">
        <div class="row">
            <div class="col-md-4 mb-3 mb-md-0">
                <h5>✨ HairCare Store</h5>
                <p class="text-muted small">Ваш надійний партнер у світі краси та догляду за волоссям.</p>
            </div>
            <div class="col-md-4 mb-3 mb-md-0">
                <h5>Навігація</h5>
                <ul class="list-unstyled">
                    <li><a href="{{ route('products.index') }}" class="text-muted text-decoration-none">Каталог</a></li>
                    {{-- <li><a href="#" class="text-muted text-decoration-none">Про нас</a></li> --}}
                </ul>
            </div>
            <div class="col-md-4">
                <h5>Слідкуйте за нами</h5>
                <a href="#" class="text-muted me-3 fs-4"><i class="bi bi-instagram"></i></a>
                <a href="#" class="text-muted me-3 fs-4"><i class="bi bi-facebook"></i></a>
                <a href="#" class="text-muted fs-4"><i class="bi bi-telegram"></i></a>
            </div>
        </div>
        <hr>
        <div class="text-center text-muted small">
            © {{ date('Y') }} HairCare Store. Всі права захищено.
        </div>
    </div>
</footer>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script>
    // JavaScript для кнопки "Нагору"
    const backToTopBtn = document.getElementById("backToTopBtn");
    window.onscroll = () => {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            backToTopBtn.style.display = "block";
        } else {
            backToTopBtn.style.display = "none";
        }
    };
    const scrollToTop = () => window.scrollTo({top: 0, behavior: 'smooth'});
</script>
</body>
</html>
