import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../auth.service';
import { isSalesperson } from '../domain/models';
import { ApiService } from '../api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-onboarding-form',
  imports: [
    MatFormFieldModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
  ],
  templateUrl: './employee-onboarding-form.component.html',
  styleUrl: './employee-onboarding-form.component.scss',
})
export class EmployeeOnboardingFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    firstName: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    lastName: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    role: this.fb.control('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly extrasForm = this.fb.group({
    commissionRate: this.fb.control(null),
    revenue: this.fb.control(null),
    certificate: this.fb.control(null),
    specialisation: this.fb.control(null),
  });

  async submit() {
    if (!this.form.valid) {
      this.snackBar.open('Make sure all fields are populated.', 'OK', {
        duration: 3000,
      });
      return;
    }
    const { firstName, lastName, email, role } = this.form.getRawValue();
    const user = this.authService.getUser()();
    if (!user || !isSalesperson(user)) {
      this.snackBar.open('No access.');
      return;
    }
    const storeId = user.store.id;
    await this.apiService.saveEmployee(
      firstName,
      lastName,
      email,
      role,
      storeId,
      this.extrasForm.getRawValue(),
    );
    this.snackBar.open('Employee was succesfully onboarded!', 'OK', {
      duration: 3000,
    });
    this.router.navigateByUrl('/home');
  }

  resetExtras() {
    this.extrasForm.setValue({
      commissionRate: null,
      certificate: null,
      specialisation: null,
      revenue: null,
    });
  }
}
