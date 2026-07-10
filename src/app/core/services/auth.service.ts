import { Injectable } from '@angular/core';
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  UserCredential,
  signOut,
  User,
  onAuthStateChanged,
  signInWithPopup
} from 'firebase/auth';
import { BehaviorSubject, Observable, catchError, of } from 'rxjs';
import { auth } from '../../app.module';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoginResponseDto } from '../../shared/dto/login-response.dto';
import { RegisterResponseDto } from '../../shared/dto/register-response.dto';
import { RegisterDto } from '../../shared/dto/register.dto';
import { v4 as uuidv4 } from "uuid";
import { SocialResponseDto } from '../../shared/dto/social-responose.dto';
import { SocialLoginDto } from '../../shared/dto/social-login.dto';
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
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser: Observable<User | null> = this.currentUserSubject.asObservable();
  private baseUrl = environment.apiUrl + "/auth";

  constructor(private http: HttpClient) {
    onAuthStateChanged(auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

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

  async loginWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    return signInWithPopup(auth, provider);
  }

  authenticateGoogle(data: {
    idToken: string;
  }): Observable<RegisterResponseDto> {

    return this.http.post<RegisterResponseDto>(
      `${this.baseUrl}/google-auth`,
      data
    );
  }
  async loginWithFacebook(): Promise<UserCredential> {
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    provider.addScope('public_profile');
    return signInWithPopup(auth, provider);
  }

  authenticateFacebook(data: {
    idToken: string;
  }): Observable<RegisterResponseDto> {

    return this.http.post<RegisterResponseDto>(
      `${this.baseUrl}/facebook-auth`,
      data
    );
  }

  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  async getUserToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  async logoutSocial(): Promise<void> {
    return signOut(auth);
  }

  isAuthenticatedSocial(): boolean {
    return !!auth.currentUser;
  }

  authenticateSocial(data: SocialLoginDto): Observable<SocialResponseDto> {

    return this.http.post<SocialResponseDto>(
      `${this.baseUrl}/social-auth`,
      data
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
