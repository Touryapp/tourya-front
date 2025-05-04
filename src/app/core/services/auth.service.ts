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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor() {
    // Monitorear los cambios en el estado de autenticación
    onAuthStateChanged(auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  // Iniciar sesión con Google
  async loginWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    // Añadir scopes para acceder a más información del usuario
    provider.addScope('profile');
    provider.addScope('email');
    return signInWithPopup(auth, provider);
  }

  // Iniciar sesión con Facebook
  async loginWithFacebook(): Promise<UserCredential> {
    const provider = new FacebookAuthProvider();
    // Añadir permisos para acceder a más información del usuario
    provider.addScope('email');
    provider.addScope('public_profile');
    return signInWithPopup(auth, provider);
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
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }
} 