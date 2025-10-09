<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Перевіряємо, чи користувач автентифікований і чи є він адміном
        if (Auth::check() && Auth::user()->is_admin) {
            return $next($request); // Якщо так, пропускаємо далі
        }

        // Якщо ні, перенаправляємо на головну сторінку
        return redirect('/');
    }
}
