import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ConciergeChatContext,
  ConciergeChatEnvelope,
  ConciergeChatRequest,
  ConciergeChatResponse,
} from '../models/concierge.model';

const SESSION_STORAGE_KEY = 'tourya.concierge.sessionId';
const SUPPORTED_LOCALES = new Set(['es', 'en', 'pt']);
const DEFAULT_LOCALE = 'es';

/**
 * Cliente Angular para el Travel Concierge (backend IA-02).
 *
 * - Genera y persiste un `sessionId` UUID por pestaña (sessionStorage,
 *   NO localStorage — asi cada pestaña tiene su propia conversacion).
 * - Toma el `locale` del TranslateService (fallback 'es' si no matchea).
 * - Delega la autorizacion JWT al AuthInterceptor global.
 * - Desempaqueta el envelope `ApiResponse<ConciergeChatResponse>`.
 *
 * NO scrubbea informacion sensible en el cliente: el backend ya remueve
 * `providerPrice` y `slotPercentageTourya` antes de responder.
 */
@Injectable({ providedIn: 'root' })
export class TravelConciergeService implements OnDestroy {
  private readonly endpoint = `${environment.apiUrl}/agents/travel-concierge/chat`;
  private sessionId: string;

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
  ) {
    this.sessionId = this.readOrCreateSessionId();
  }

  ngOnDestroy(): void {
    // Sin cleanup: el session storage sobrevive al servicio para permitir
    // continuidad si el widget se destruye y recrea.
  }

  /**
   * Envia un mensaje al concierge y devuelve la respuesta del asistente.
   */
  chat(
    message: string,
    context?: ConciergeChatContext,
  ): Observable<ConciergeChatResponse> {
    const trimmed = (message || '').trim();
    if (!trimmed) {
      return throwError(() => new Error('empty_message'));
    }

    const body: ConciergeChatRequest = {
      sessionId: this.sessionId,
      userMessage: trimmed,
      locale: this.resolveLocale(),
    };

    if (context && (context.tourId != null || context.cartId != null)) {
      body.context = { ...context };
    }

    return this.http
      .post<ConciergeChatEnvelope>(this.endpoint, body)
      .pipe(
        map((envelope) => this.unwrap(envelope)),
        catchError((err) => throwError(() => err)),
      );
  }

  /**
   * Reinicia la conversacion actual (nuevo sessionId).
   * El backend perdera el contexto previo del thread.
   */
  resetSession(): void {
    this.sessionId = this.createSessionId();
    this.persistSessionId(this.sessionId);
  }

  /** Devuelve el sessionId actual (util para tests o telemetria interna). */
  getSessionId(): string {
    return this.sessionId;
  }

  private unwrap(envelope: ConciergeChatEnvelope | null | undefined): ConciergeChatResponse {
    if (!envelope) {
      throw new Error('empty_response');
    }
    if (envelope.success === false || !envelope.data) {
      throw new Error(envelope.error || 'concierge_error');
    }
    return envelope.data;
  }

  private resolveLocale(): string {
    const raw = (this.translate.currentLang || this.translate.defaultLang || DEFAULT_LOCALE)
      .toLowerCase();
    const base = raw.split('-')[0];
    return SUPPORTED_LOCALES.has(base) ? base : DEFAULT_LOCALE;
  }

  private readOrCreateSessionId(): string {
    try {
      const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (existing && existing.length > 0) {
        return existing;
      }
    } catch {
      // sessionStorage puede fallar en modo privado / SSR; generamos igual.
    }
    const fresh = this.createSessionId();
    this.persistSessionId(fresh);
    return fresh;
  }

  private persistSessionId(id: string): void {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    } catch {
      // Ignorar fallos de storage — el sessionId sigue vivo en memoria.
    }
  }

  private createSessionId(): string {
    const cryptoObj = (typeof crypto !== 'undefined' ? crypto : undefined) as
      | (Crypto & { randomUUID?: () => string })
      | undefined;
    if (cryptoObj?.randomUUID) {
      return cryptoObj.randomUUID();
    }
    return this.pseudoUuid();
  }

  /**
   * Fallback determinista (RFC4122 v4-like) para navegadores sin crypto.randomUUID.
   */
  private pseudoUuid(): string {
    const bytes = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i++) {
        bytes[i] = Math.floor(Math.random() * 256);
      }
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
}
