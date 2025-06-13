import { Component, inject } from '@angular/core';
import { ApiService } from '../api.service';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stores',
  imports: [MatTableModule],
  templateUrl: './stores.component.html',
  styleUrl: './stores.component.scss',
})
export class StoresComponent {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  readonly stores = this.apiService.getStores();
  readonly displayedColumns = ['address', 'zipCode'];

  goToStoreDetails(storeId: string): void {
    this.router.navigateByUrl('/bikes?storeId=' + storeId);
  }
}
