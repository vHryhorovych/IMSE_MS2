import { Component, inject, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { AnalyticsHryhorovychEntry } from '../domain/models';
import { MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-analytics-hryhorovych',
  imports: [
    MatFormFieldModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTableModule,
    DatePipe,
  ],
  templateUrl: './analytics-hryhorovych.component.html',
  styleUrl: './analytics-hryhorovych.component.scss',
})
export class AnalyticsHryhorovychComponent implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  analytics: AnalyticsHryhorovychEntry[] = [];
  columnsToDisplay = ['month', 'address', 'revenue'];

  readonly filtersForm = this.fb.group({
    startDate: this.fb.control(null),
    endDate: this.fb.control(null),
  });

  ngOnInit(): void {
    this.filtersForm.valueChanges.subscribe(() => this.loadAnalytics());
  }

  async loadAnalytics() {
    const { startDate, endDate } = this.filtersForm.value;
    if (!startDate || !endDate) {
      return;
    }
    this.analytics = await this.apiService.analyticsHryhorovych(
      startDate,
      endDate,
    );
  }
}
