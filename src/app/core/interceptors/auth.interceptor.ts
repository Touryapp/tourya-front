import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService, RefreshResponseDto } from '../services/auth.service';

const AUTH_ENDPOINTS_TO_SKIP = ['/auth/refresh', '/auth/logout', '/auth/authenticate', '/auth/register', '/auth/social-auth', '/auth/google-auth', '/auth/facebook-auth', '/auth/forgot-password', '/auth/reset-password'];

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> =
    new BehaviorSubject<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.authService.getAccessToken();
    const authRequest = token ? this.addToken(request, token) : request;

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status !== 401 || this.isAuthEndpoint(request)) {
          return throwError(() => error);
        }
        if (this.authService.getRefreshToken()) {
          return this.handle401(request, next);
        }
        this.forceLogout();
        return throwError(() => error);
      })
    );
  }

  private isAuthEndpoint(request: HttpRequest<unknown>): boolean {
    return AUTH_ENDPOINTS_TO_SKIP.some((endpoint) => request.url.includes(endpoint));
  }

  private addToken(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private handle401(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) => next.handle(this.addToken(request, token as string)))
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.authService.refresh().pipe(
      switchMap((response: RefreshResponseDto) => {
        this.isRefreshing = false;
        this.authService.setTokens(response.accessToken, response.refreshToken);
        this.refreshTokenSubject.next(response.accessToken);
        return next.handle(this.addToken(request, response.accessToken));
      }),
      catchError((refreshError) => {
        this.isRefreshing = false;
        this.refreshTokenSubject.next(null);
        this.forceLogout();
        return throwError(() => refreshError);
      })
    );
  }

  private forceLogout(): void {
    this.authService.removeTokens();
    this.router.navigate(['/login']);
  }
}
