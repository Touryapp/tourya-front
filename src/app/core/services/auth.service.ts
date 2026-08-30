import { Injectable } from '@angular/core';
import { TouristService } from '../../shared/services/tourist.service';
import { Observable, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoginResponseDto } from '../../shared/dto/login-response.dto';
import { RegisterResponseDto } from '../../shared/dto/register-response.dto';
import { RegisterDto } from '../../shared/dto/register.dto';
import { v4 as uuidv4 } from "uuid";
import { SocialResponseDto } from '../../shared/dto/social-responose.dto';
import { RoleDto } from '../../shared/dto/role.dto';
import { Roles } from '../../shared/enums/roles.enum';
import { RequestsProvidersStatus } from '../../shared/enums/requests-providers-status.enum';

export interface RefreshResponseDto {
  accessToken: string;
  refreshToken: string;
}

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const LEGACY_TOKEN_KEY = 'token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl + "/auth";

  constructor(
    private http: HttpClient,
    private touristService: TouristService
  ) {}

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  getToken(): string | null {
    return this.getAccessToken();
  }

  getAccessToken(): string | null {
    return (
      localStorage.getItem(ACCESS_TOKEN_KEY) ||
      localStorage.getItem(LEGACY_TOKEN_KEY)
    );
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  setToken(token: string): void {
    this.setTokens(token, null);
  }

  setTokens(accessToken: string, refreshToken: string | null): void {
    if (accessToken) {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(LEGACY_TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
    sessionStorage.removeItem("providerPanelView");
  }

  setTokensFromResponse(response: {
    token?: string;
    accessToken?: string;
    refreshToken?: string;
  }): void {
    const accessToken = response.accessToken || response.token || '';
    const refreshToken = response.refreshToken || null;
    if (accessToken) {
      this.setTokens(accessToken, refreshToken);
    }
  }

  removeToken(): void {
    this.removeTokens();
  }

  removeTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    // TC-009 (#196 v4): invalidar caches por-user para que un logout limpio no
    // deje datos del user anterior visibles al proximo login (Luis 2026-08-03).
    this.touristService.clearProfileCache();
  }

  setUser(user: any): void {
    localStorage.setItem("user", JSON.stringify(user));
  }

  getUser(): any {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  register(data: RegisterDto): Observable<RegisterResponseDto> {
    const uuid = uuidv4();

    return this.http.post<RegisterResponseDto>(
      `${this.baseUrl}/register`,
      {
        ...data,
      },
      {
        params: {
          "message-uid": uuid,
        },
      }
    );
  }

  login(data: {
    email: string;
    password: string;
  }): Observable<LoginResponseDto> {
    const uuid = uuidv4();

    return this.http.post<LoginResponseDto>(
      `${this.baseUrl}/authenticate`,
      data,
      {
        params: {
          "message-uid": uuid,
        },
      }
    );
  }

  refresh(): Observable<RefreshResponseDto> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<RefreshResponseDto>(`${this.baseUrl}/refresh`, {
      refreshToken,
    });
  }

  /**
   * SEC-06 / FE-02 (Token Exchange): envia el id_token que emitio Google
   * Identity Services al backend, que lo valida contra las claves publicas de
   * Google antes de emitir el JWT propio de Tourya. Reemplaza al viejo
   * flujo authenticateSocial + Firebase SDK.
   */
  authenticateWithGoogle(idToken: string): Observable<SocialResponseDto> {
    return this.http.post<SocialResponseDto>(
      `${this.baseUrl}/google`,
      { idToken }
    );
  }

  /**
   * SEC-06 / FE-02 (Token Exchange): envia el accessToken que emitio Facebook
   * JS SDK al backend, que lo valida via Graph API antes de emitir el JWT
   * propio.
   */
  authenticateWithFacebook(accessToken: string): Observable<SocialResponseDto> {
    return this.http.post<SocialResponseDto>(
      `${this.baseUrl}/facebook`,
      { accessToken }
    );
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();

    if (refreshToken) {
      this.http
        .post(`${this.baseUrl}/logout`, { refreshToken })
        .pipe(catchError(() => of(null)))
        .subscribe();
    }

    this.removeTokens();
    localStorage.removeItem("user");
    localStorage.removeItem("requestProviderStatus");
    localStorage.removeItem("idProvider");

    sessionStorage.removeItem("providerPanelView");
    sessionStorage.removeItem("menuValue");
  }

  isAdmin(): boolean {
    const user = this.getUser();
    if (!user) return false;

    const roleList: RoleDto[] = user.roleList || user.roles || [];
    return roleList.some((r: RoleDto) => r.id === Roles.ADMIN);
  }

  isProvider(): boolean {
    const user = this.getUser();
    if (!user) return false;

    const roleList: RoleDto[] = user.roleList || user.roles || [];
    return roleList.some((r: RoleDto) => r.id === Roles.PROVIDER);
  }

  isProviderOperator(): boolean {
    const user = this.getUser();
    if (!user) return false;

    const roleList: RoleDto[] = user.roleList || user.roles || [];
    return roleList.some((r: RoleDto) => r.id === Roles.PROVIDER_OPERATOR);
  }

  /**
   * FE-15: usuario con rol BACKOFFICE_OPERATION (staff Tourya que da soporte).
   * Distinto de ADMIN — ADMIN también aprueba tours y setea comisión.
   * Alcance exacto de permisos por pantalla queda pendiente hasta confirmación de Luis (P2).
   */
  isBackofficeOperation(): boolean {
    const user = this.getUser();
    if (!user) return false;

    const roleList: RoleDto[] = user.roleList || user.roles || [];
    return roleList.some((r: RoleDto) => r.id === Roles.BACKOFFICE_OPERATION);
  }

  /**
   * FE-15: paridad con backend `Utils.isTouryaBackoffice()` — ADMIN o BACKOFFICE_OPERATION.
   * Uso: gate de vistas cross-provider (ver reservas de todos los proveedores, moderar reviews, etc.).
   * NO reemplaza a `isAdmin()` en operaciones exclusivas del ADMIN (aprobar tour, setear comisión).
   */
  isTouryaBackoffice(): boolean {
    return this.isAdmin() || this.isBackofficeOperation();
  }

  isUser(): boolean {
    const user = this.getUser();
    if (!user) return false;

    const roleList: RoleDto[] = user.roleList || user.roles || [];
    return roleList.some((r: RoleDto) => r.id === Roles.USER);
  }

  setRequestProviderStatus(status: RequestsProvidersStatus): void {
    localStorage.setItem("requestProviderStatus", status);
  }

  getRequestProviderStatus(): RequestsProvidersStatus | null {
    const status = localStorage.getItem("requestProviderStatus");
    return status as RequestsProvidersStatus || null;
  }
  setIdProvider(id: number): void {
    localStorage.setItem("idProvider", id.toString());
  }
  getIdProvider(): number | null {
    const id = localStorage.getItem("idProvider");
    return id ? parseInt(id) : null;
  }

  /**
   * Get user's display name (first name + first surname)
   * Examples:
   * - "Luis Daniel Mendoza Owkin" -> "Luis Mendoza"
   * - "Juan Pérez" -> "Juan Pérez"
   * - "María" -> "María"
   */
  getUserDisplayName(): string {
    const user = this.getUser();
    if (!user || !user.fullName) {
      return 'Usuario';
    }

    const nameParts = user.fullName.trim().split(/\s+/);

    if (nameParts.length === 0) {
      return 'Usuario';
    }

    if (nameParts.length === 1) {
      return nameParts[0];
    }

    if (nameParts.length === 2) {
      return `${nameParts[0]} ${nameParts[1]}`;
    }

    const firstName = nameParts[0];
    const middleIndex = Math.floor(nameParts.length / 2);
    const firstSurname = nameParts[middleIndex];

    return `${firstName} ${firstSurname}`;
  }
}
