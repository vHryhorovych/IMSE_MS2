import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  Routes,
} from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AuthService } from './auth.service';
import { inject, Injectable } from '@angular/core';
import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { StoresComponent } from './stores/stores.component';
import { BikesComponent } from './bikes/bikes.component';
import { BikeRentalFormComponent } from './bike-rental-form/bike-rental-form.component';
import { AnalyticsHryhorovychComponent } from './analytics-hryhorovych/analytics-hryhorovych.component';
import { EmployeeOnboardingFormComponent } from './employee-onboarding-form/employee-onboarding-form.component';
import { AnalyticsSemberaComponent } from './analytics-sembera/analytics-sembera.component';

@Injectable()
export class IsLoggedIn implements CanActivate {
  private readonly authService = inject(AuthService);
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    const requiredRoles = route.data['roles'] as (
      | 'salesperson'
      | 'customer'
      | null
    )[];
    const isAuthenticated = this.authService.isAuthenticated()();
    const isRoleValid = requiredRoles
      ? requiredRoles.includes(this.authService.getUserRole()())
      : true;
    return isAuthenticated && isRoleValid;
  }
}

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'auth',
    component: AuthComponent,
  },
  { path: 'home', component: HomeComponent, canActivate: [IsLoggedIn] },
  {
    path: 'onboarding',
    component: EmployeeOnboardingFormComponent,
    canActivate: [IsLoggedIn],
    data: { roles: ['salesperson', 'technician'] },
  },
  {
    path: 'stores',
    component: StoresComponent,
    canActivate: [IsLoggedIn],
    data: { roles: ['customer'] },
  },
  {
    path: 'bikes',
    component: BikesComponent,
    canActivate: [IsLoggedIn],
    data: { roles: ['customer'] },
  },
  {
    path: 'bikes/:id/rent',
    component: BikeRentalFormComponent,
    canActivate: [IsLoggedIn],
    data: { roles: ['customer'] },
  },
  {
    path: 'analytics/hryhorovych',
    component: AnalyticsHryhorovychComponent,
    canActivate: [IsLoggedIn],
    data: { roles: ['customer'] },
  },
  {
    path: 'analytics/sembera',
    component: AnalyticsSemberaComponent,
    canActivate: [IsLoggedIn],
    data: { roles: ['salesperson', 'technician'] },
  },
];
