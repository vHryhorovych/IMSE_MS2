import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { MatTableModule } from '@angular/material/table';
import { User } from '../domain/models';

@Component({
  selector: 'app-auth',
  imports: [MatButtonModule, MatTableModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiService);

  readonly customers = this.apiService.getCustomers();
  readonly salespersons = this.apiService.getEmployees();

  readonly columns = ['firstName', 'lastName'];

  selectedRole: 'salesperson' | 'customer' | null = null;
  step: 'role' | 'user' = 'role';

  selectRole(role: 'salesperson' | 'customer'): void {
    this.selectedRole = role;
    this.step = 'user';
  }

  selectUser(user: User): void {
    this.authService.authenticate(user);
    this.router.navigateByUrl('/home');
  }

  goBack() {
    this.step = 'role';
    this.selectedRole = null;
  }
}
