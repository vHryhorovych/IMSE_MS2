import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-bike-rental-form',
  imports: [
    ReactiveFormsModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './bike-rental-form.component.html',
  styleUrl: './bike-rental-form.component.scss',
})
export class BikeRentalFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly apiService = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly bikeId = this.activatedRoute.snapshot.paramMap.get('id') || '';

  readonly form = this.fb.group({
    startDate: this.fb.control<Date | null>(null),
    endDate: this.fb.control<Date | null>(null),
  });

  async submit() {
    console.log(this.form.value);
    const { startDate, endDate } = this.form.value;
    if (!startDate || !endDate) {
      this.snackBar.open('Please select both start and end dates.', 'Close', {
        duration: 3000,
      });
      return;
    }
    if (startDate >= endDate) {
      this.snackBar.open('End date must be after start date.', 'Close', {
        duration: 3000,
      });
      return;
    }
    const available = await this.apiService.checkBikeAvailability(
      this.bikeId,
      startDate.toISOString(),
      endDate.toISOString(),
    );
    if (!available) {
      this.snackBar.open(
        'The bike is not available for the selected period.',
        'Close',
        {
          duration: 3000,
        },
      );
      return;
    }

    const user = this.authService.getUser()();
    if (!user) {
      return;
    }
    await this.apiService.rentBike(
      this.bikeId,
      user.id,
      startDate.toISOString(),
      endDate.toISOString(),
    );
    this.router.navigateByUrl('/home');
  }
}
