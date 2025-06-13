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
  {
    path: 'auth',
    component: AuthComponent,
  },
  { path: 'home', component: HomeComponent, canActivate: [IsLoggedIn] },
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
];
