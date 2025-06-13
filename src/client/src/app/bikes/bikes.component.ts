import { Component, inject } from '@angular/core';
import { ApiService } from '../api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-bikes',
  imports: [MatTableModule],
  templateUrl: './bikes.component.html',
  styleUrl: './bikes.component.scss',
})
export class BikesComponent {
  private readonly apiService = inject(ApiService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly displayedColumns = ['model', 'price'];

  readonly bikes = this.apiService.getBikes(
    this.activatedRoute.snapshot.queryParamMap.get('storeId') || '0',
  );

  rentBike(bikeId: string): void {
    this.router.navigateByUrl(`/bikes/${bikeId}/rent`, {});
  }
}
