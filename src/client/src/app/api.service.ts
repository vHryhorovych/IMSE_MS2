import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Bike, User, Store } from './domain/models';
import { firstValueFrom, map } from 'rxjs';

type ApiResponse<T> = {
  data: T;
  message: string;
  success: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:3000';
  private readonly http = inject(HttpClient);

  getStores(): Signal<Store[] | undefined> {
    return toSignal(
      this.http
        .get<ApiResponse<Store[]>>(`${this.baseUrl}/store`)
        .pipe(map((r) => r.data)),
    );
  }

  getCustomers(): Signal<User[] | undefined> {
    return toSignal(
      this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/customer`).pipe(
        map((r) =>
          r.data.map((user) => ({
            ...user,
            role: 'customer',
          })),
        ),
      ),
    );
  }

  getEmployees(): Signal<User[] | undefined> {
    return toSignal(
      this.http
        .get<ApiResponse<User[]>>(`${this.baseUrl}/employee`)
        .pipe(
          map((r) => r.data.map((user) => ({ ...user, role: 'salesperson' }))),
        ),
    );
  }

  getBikes(storeId: number | string): Signal<Bike[] | undefined> {
    return toSignal(
      this.http
        .get<ApiResponse<Bike[]>>(`${this.baseUrl}/bike?storeId=${storeId}`)
        .pipe(map((r) => r.data)),
    );
  }

  checkBikeAvailability(
    bikeId: string | string,
    startDate: string,
    endDate: string,
  ): Promise<boolean> {
    return firstValueFrom(
      this.http
        .get<ApiResponse<{ available: boolean }>>(
          `${this.baseUrl}/bike/${bikeId}/check-availability?startDate=${startDate}&endDate=${endDate}`,
        )
        .pipe(map((r) => r.data.available)),
    );
  }

  rentBike(
    bikeId: string | string,
    customerId: number | string,
    startDate: string,
    endDate: string,
  ): Promise<{ rentalId: number }> {
    return firstValueFrom(
      this.http
        .post<ApiResponse<{ rentalId: number }>>(
          `${this.baseUrl}/bike/${bikeId}/rent`,
          {
            customerId,
            startDate,
            endDate,
          },
        )
        .pipe(map((r) => r.data)),
    );
  }

  getAppCtx() {
    return firstValueFrom(
      this.http
        .get<ApiResponse<{ db: 'pg' | 'mongo'; dataImported: boolean }>>(
          `${this.baseUrl}/ctx`,
        )
        .pipe(map((r) => r.data)),
    );
  }

  switchToMongo() {
    return firstValueFrom(
      this.http.post<ApiResponse<void>>(`${this.baseUrl}/switch-to-mongo`, {}),
    );
  }

  importData() {
    return firstValueFrom(
      this.http.post<ApiResponse<void>>(`${this.baseUrl}/import`, {}),
    );
  }
}
