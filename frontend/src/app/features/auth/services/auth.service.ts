import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { AuthUser, LoginPayload, RegisterPayload } from '../../../core/models/auth-user.model';

interface StoredAuthUser extends AuthUser {
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly usersStorageKey = 'viva-ruta-users';
  private readonly sessionStorageKey = 'viva-ruta-current-user';

  private readonly usersSubject = new BehaviorSubject<StoredAuthUser[]>(this.loadStoredUsers());
  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(this.loadStoredCurrentUser());

  readonly users$ = this.usersSubject.asObservable();
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

  registerUser(payload: RegisterPayload): AuthUser {
    const normalizedEmail = payload.email.trim().toLowerCase();

    const existingUsers = this.usersSubject.value;
    const userExists = existingUsers.some((user) => user.email === normalizedEmail);

    if (userExists) {
      throw new Error('Ya existe una cuenta con ese correo.');
    }

    const newUser: StoredAuthUser = {
      id: this.createId(),
      name: payload.name.trim(),
      email: normalizedEmail,
      role: payload.role,
      phone: payload.phone,
      birthDate: payload.birthDate,
      department: payload.department,
      city: payload.city,
      password: payload.password
    };

    const nextUsers = [newUser, ...existingUsers];
    this.usersSubject.next(nextUsers);
    localStorage.setItem(this.usersStorageKey, JSON.stringify(nextUsers));

    const publicUser: AuthUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      birthDate: newUser.birthDate,
      department: newUser.department,
      city: newUser.city
    };

    this.setCurrentUser(publicUser);
    return publicUser;
  }

  loginUser(payload: LoginPayload): AuthUser {
    const normalizedEmail = payload.email.trim().toLowerCase();

    const storedUser = this.usersSubject.value.find((user) => user.email === normalizedEmail);

    if (!storedUser) {
      throw new Error('No existe una cuenta con ese correo.');
    }

    if (storedUser.password !== payload.password) {
      throw new Error('La contraseña es incorrecta.');
    }

    const publicUser: AuthUser = {
      id: storedUser.id,
      name: storedUser.name,
      email: storedUser.email,
      role: storedUser.role,
      phone: storedUser.phone,
      birthDate: storedUser.birthDate,
      department: storedUser.department,
      city: storedUser.city
    };

    this.setCurrentUser(publicUser);
    return publicUser;
  }

  logout(): void {
    this.currentUserSubject.next(null);
    sessionStorage.removeItem(this.sessionStorageKey);
  }

  deleteCurrentUser(): void {
    const currentUser = this.currentUserSubject.value;

    if (!currentUser) {
      return;
    }

    const nextUsers = this.usersSubject.value.filter((user) => user.id !== currentUser.id);
    this.usersSubject.next(nextUsers);
    localStorage.setItem(this.usersStorageKey, JSON.stringify(nextUsers));
    this.setCurrentUser(null);
  }

  getStoredPasswordById(userId: number): string | null {
    return this.usersSubject.value.find((user) => user.id === userId)?.password ?? null;
  }

  updateCurrentUser(payload: {
    id: number;
    name: string;
    email: string;
    password: string;
    role: AuthUser['role'];
    phone: string;
    birthDate: string;
    department: string;
    city: string;
  }): AuthUser {
    const normalizedEmail = payload.email.trim().toLowerCase();
    const existingUsers = this.usersSubject.value;
    const duplicateUser = existingUsers.find((user) => user.email === normalizedEmail && user.id !== payload.id);

    if (duplicateUser) {
      throw new Error('Ya existe una cuenta con ese correo.');
    }

    const updatedUser: StoredAuthUser = {
      id: payload.id,
      name: payload.name.trim(),
      email: normalizedEmail,
      role: payload.role,
      phone: payload.phone,
      birthDate: payload.birthDate,
      department: payload.department,
      city: payload.city,
      password: payload.password
    };

    const nextUsers = existingUsers.map((user) => user.id === payload.id ? updatedUser : user);
    this.usersSubject.next(nextUsers);
    localStorage.setItem(this.usersStorageKey, JSON.stringify(nextUsers));

    const publicUser: AuthUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      phone: updatedUser.phone,
      birthDate: updatedUser.birthDate,
      department: updatedUser.department,
      city: updatedUser.city
    };

    this.setCurrentUser(publicUser);
    return publicUser;
  }

  private loadStoredUsers(): StoredAuthUser[] {
    const rawUsers = localStorage.getItem(this.usersStorageKey);

    if (!rawUsers) {
      return [];
    }

    try {
      return JSON.parse(rawUsers) as StoredAuthUser[];
    } catch {
      return [];
    }
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

  private createId(): number {
    const maxId = this.usersSubject.value.reduce((acc, user) => Math.max(acc, user.id), 0);
    return maxId + 1;
  }
}
