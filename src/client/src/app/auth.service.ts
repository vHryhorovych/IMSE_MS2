import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { User } from './domain/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _isAuthenticated = signal(false);
  private _userRole: WritableSignal<'salesperson' | 'customer' | null> =
    signal(null);
  private _user: WritableSignal<User | null> = signal(null);

  authenticate(user: User): void {
    this._user.set(user);
    this._isAuthenticated.set(true);
    this._userRole.set(user.role);
  }

  isAuthenticated(): Signal<boolean> {
    return this._isAuthenticated;
  }

  getUserRole(): Signal<'salesperson' | 'customer' | null> {
    return this._userRole;
  }

  getUser(): Signal<User | null> {
    return this._user;
  }
}
