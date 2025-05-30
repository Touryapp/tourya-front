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
import { BehaviorSubject, Observable } from 'rxjs';
import { auth } from '../../app.module';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { LoginResponseDto } from '../../shared/dto/login-response.dto';
import { RegisterResponseDto } from '../../shared/dto/register-response.dto';
import { RegisterDto } from '../../shared/dto/register.dto';
import { v4 as uuidv4 } from "uuid";
import { SocialResponseDto } from '../../shared/dto/social-responose.dto';
import { SocialLoginDto } from '../../shared/dto/social-login.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser: Observable<User | null> = this.currentUserSubject.asObservable();
  private baseUrl = environment.apiUrl + "/auth";

  constructor(private http: HttpClient) {
    // Monitorear los cambios en el estado de autenticación
    onAuthStateChanged(auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem("token");
  }

  // Get the authentication token
  getToken(): string | null {
    return localStorage.getItem("token");
  }

  // Set the authentication token
  setToken(token: string): void {
    localStorage.setItem("token", token);
  }

  // Remove the authentication token
  removeToken(): void {
    localStorage.removeItem("token");
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

  // Iniciar sesión con Google
  async loginWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    // Añadir scopes para acceder a más información del usuario
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
  // Iniciar sesión con Facebook
  async loginWithFacebook(): Promise<UserCredential> {
    const provider = new FacebookAuthProvider();
    // Añadir permisos para acceder a más información del usuario
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

  // Obtener datos del usuario actual
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Obtener token del usuario
  async getUserToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    return signOut(auth);
  }

  // Verificar si el usuario está autenticado
  isAuthenticatedSocial(): boolean {
    return !!auth.currentUser;
  }

  authenticateSocial(data: SocialLoginDto): Observable<SocialResponseDto> {

    return this.http.post<SocialResponseDto>(
      `${this.baseUrl}/social-auth`,
      data
    );
  }
} 