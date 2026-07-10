import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

/**
 * Formato del value que persiste el backend en la columna JSONB config_value.
 * Para las claves escalares (numeros y feature flags 0/1) siempre usa el
 * patron { "value": N }. Para CANCELLATION_POLICY es un JSON estructurado
 * distinto (no atendido en este panel).
 */
export interface AppConfigValue {
  value: number;
}

/**
 * Respuesta cruda del backend para GET /config/{key}.
 * El controller AppConfigController devuelve el Map<String,Object> almacenado
 * directamente; para claves escalares eso es { "value": N }.
 */
export type RawConfigValue = Record<string, unknown>;

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el valor crudo de una configuracion por su clave.
   * @throws 404 si la clave no existe en la BD (fuera del enum ConfigKeyEnum).
   */
  getConfig(configKey: string): Observable<RawConfigValue> {
    return this.http.get<RawConfigValue>(`${this.apiUrl}/config/${configKey}`);
  }

  /**
   * Upsert de una configuracion por clave. Solo ADMIN.
   * El backend espera { value: {...}, description?: string }.
   * Retorna el AppConfig completo guardado (id, config_key, config_value, ...).
   */
  updateConfig(configKey: string, value: AppConfigValue, description?: string): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/config/${configKey}`, {
      value,
      description
    });
  }
}
