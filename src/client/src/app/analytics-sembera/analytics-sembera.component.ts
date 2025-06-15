import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { AnalyticsSemberaEntry } from '../domain/models';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-analytics-sembera',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSnackBarModule,
  ],
  templateUrl: './analytics-sembera.component.html',
  styleUrl: './analytics-sembera.component.scss',
})
export class AnalyticsSemberaComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  readonly form = this.fb.group({
    zipcodeMin: this.fb.control(null),
    zipcodeMax: this.fb.control(null),
  });

  analytics: AnalyticsSemberaEntry[] = [];

  columnsToDisplay = [
    'address',
    'salesPersonsN',
    'newlyHiredSalespersonsN',
    'totalRevenue',
    'avgRevenue',
    'techniciansN',
    'employees',
  ];

  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => this.updateAnalytics());
  }

  async updateAnalytics() {
    const { zipcodeMin, zipcodeMax } = this.form.value;
    if (!zipcodeMin || !zipcodeMax) {
      return;
    }
    this.analytics = await this.apiService.analyticsSembera(
      zipcodeMin,
      zipcodeMax,
    );
  }
}
