import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { v4 as uuidv4 } from "uuid";
import { RegisterDto } from "../shared/dto/register.dto";
import { RegisterResponseDto } from "../shared/dto/register-response.dto";
import { environment } from "../../environments/environment";
import { LoginResponseDto } from "../shared/dto/login-response.dto";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private baseUrl = environment.apiUrl + "/auth";

  constructor(private http: HttpClient) {}

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
}
