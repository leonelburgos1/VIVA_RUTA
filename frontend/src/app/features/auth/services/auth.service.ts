import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, firstValueFrom, map } from 'rxjs';
import { AuthUser, LoginPayload, RegisterPayload } from '../../../core/models/auth-user.model';

interface AuthTokens {
  access: string;
  refresh: string;
}

interface TokenResponse {
  access: string;
  refresh: string;
}

interface UserApiResponse {
  id: number;
  name: string;
  email: string;
  role: AuthUser['role'];
  phone: string;
  birthDate: string;
  department: string;
  city: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionStorageKey = 'viva-ruta-current-user';
  private readonly tokenStorageKey = 'viva-ruta-tokens';
  private readonly apiBaseUrl = 'http://localhost:8000/api';

  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(this.loadStoredCurrentUser());

  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly isAuthenticated$ = this.currentUser$.pipe(map((user) => !!user));
  readonly isAdmin$ = this.currentUser$.pipe(map((user) => user?.role === 'admin'));

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  get isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  async registerUser(payload: RegisterPayload): Promise<AuthUser> {
    const normalizedEmail = payload.email.trim().toLowerCase();

    await firstValueFrom(
      this.http.post<UserApiResponse>(
        `${this.apiBaseUrl}/users/`,
        {
          name: payload.name.trim(),
          email: normalizedEmail,
          password: payload.password,
          role: payload.role,
          phone: payload.phone,
          birthDate: payload.birthDate,
          department: payload.department,
          city: payload.city
        }
      )
    );

    return this.loginUser({
      email: normalizedEmail,
      password: payload.password
    });
  }

  async loginUser(payload: LoginPayload): Promise<AuthUser> {
    const normalizedEmail = payload.email.trim().toLowerCase();

    const tokenResponse = await firstValueFrom(
      this.http.post<TokenResponse>(`${this.apiBaseUrl}/token/`, {
        email: normalizedEmail,
        password: payload.password
      })
    );

    this.storeTokens(tokenResponse);

    const profile = await firstValueFrom(
      this.http.get<UserApiResponse[]>(`${this.apiBaseUrl}/users/`, {
        headers: this.getAuthHeaders()
      })
    );

    const user = profile[0];

    if (!user) {
      throw new Error('No pudimos cargar el perfil del usuario.');
    }

    this.setCurrentUser(this.normalizeUser(user));
    return this.currentUser as AuthUser;
  }

  logout(): void {
    this.clearAuthState();
  }

  async deleteCurrentUser(): Promise<void> {
    const currentUser = this.currentUser;

    if (!currentUser) {
      return;
    }

    await firstValueFrom(
      this.http.delete<void>(`${this.apiBaseUrl}/users/${currentUser.id}/`, {
        headers: this.getAuthHeaders()
      })
    );

    this.clearAuthState();
  }

  async updateCurrentUser(payload: {
    id: number;
    name: string;
    email: string;
    currentPassword: string;
    newPassword: string;
    role: AuthUser['role'];
    phone: string;
    birthDate: string;
    department: string;
    city: string;
  }): Promise<AuthUser> {
    const normalizedEmail = payload.email.trim().toLowerCase();

    const updatedUser = await firstValueFrom(
      this.http.patch<UserApiResponse>(
        `${this.apiBaseUrl}/users/${payload.id}/`,
        {
          name: payload.name.trim(),
          email: normalizedEmail,
          currentPassword: payload.currentPassword,
          newPassword: payload.newPassword,
          role: payload.role,
          phone: payload.phone,
          birthDate: payload.birthDate,
          department: payload.department,
          city: payload.city
        },
        {
          headers: this.getAuthHeaders()
        }
      )
    );

    this.setCurrentUser(this.normalizeUser(updatedUser));
    return this.currentUser as AuthUser;
  }

  private getAuthHeaders(): HttpHeaders {
    const tokens = this.loadStoredTokens();

    if (!tokens?.access) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${tokens.access}`
    });
  }

  private loadStoredTokens(): AuthTokens | null {
    const rawTokens = localStorage.getItem(this.tokenStorageKey);

    if (!rawTokens) {
      return null;
    }

    try {
      return JSON.parse(rawTokens) as AuthTokens;
    } catch {
      return null;
    }
  }

  private storeTokens(tokens: TokenResponse): void {
    localStorage.setItem(this.tokenStorageKey, JSON.stringify(tokens));
  }

  private loadStoredCurrentUser(): AuthUser | null {
    const rawCurrentUser = sessionStorage.getItem(this.sessionStorageKey);

    if (!rawCurrentUser) {
      return null;
    }

    try {
      return JSON.parse(rawCurrentUser) as AuthUser;
    } catch {
      return null;
    }
  }

  private setCurrentUser(user: AuthUser | null): void {
    this.currentUserSubject.next(user);

    if (user) {
      sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(user));
      return;
    }

    sessionStorage.removeItem(this.sessionStorageKey);
  }

  private clearAuthState(): void {
    this.currentUserSubject.next(null);
    sessionStorage.removeItem(this.sessionStorageKey);
    localStorage.removeItem(this.tokenStorageKey);
  }

  private normalizeUser(user: UserApiResponse): AuthUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      birthDate: user.birthDate,
      department: user.department,
      city: user.city
    };
  }
}
