<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\AuthenticatesUsers;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Login Controller
    |--------------------------------------------------------------------------
    */

    use AuthenticatesUsers;

    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('guest')->except('logout');
        $this->middleware('auth')->only('logout');
    }

    /**
     * Визначає, куди перенаправити користувача після входу.
     *
     * @return string
     */
    protected function redirectTo()
    {
        // Якщо користувач є адміном
        if (Auth::user()->is_admin) {
            // Перенаправляємо його на сторінку замовлень в адмінці
            return route('admin.orders.index');
        }

        // Всіх інших користувачів перенаправляємо на головну сторінку
        return '/';
    }
}
