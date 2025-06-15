import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../auth.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [MatButtonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly authService = inject(AuthService);

  userRole = this.authService.getUserRole();
  useCaseUrl = this.userRole() === 'salesperson' ? '/onboarding' : '/stores';
  analyticsUrl =
    this.userRole() === 'salesperson'
      ? '/analytics/sembera'
      : '/analytics/hryhorovych';
}
