import { Component, computed, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ApiService } from './api.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly authService = inject(AuthService);

  isAuthenticated = this.authService.isAuthenticated();
  isMongoSelected = false;
  isDataImported = false;
  // TODO: data not shown after import
  async ngOnInit() {
    const { db, dataImported } = await this.apiService.getAppCtx();
    this.isMongoSelected = db === 'mongo';
    this.isDataImported = dataImported;
    this.router.navigate(['/auth']);
  }

  async switchToMongo() {
    await this.apiService.switchToMongo();
    this.snackBar.open('Successfully migrated to MongoDB.', 'OK', {
      duration: 3000,
    });
    this.isMongoSelected = true;
    this.authService.logout();
    location.replace('http://localhost:3000/');
  }

  async importData() {
    await this.apiService.importData();
    this.snackBar.open('Successfully imported data to PG.', 'OK', {
      duration: 3000,
    });
    this.isDataImported = true;
    this.authService.logout();
    location.replace('http://localhost:3000/');
  }

  goToAuth() {
    this.authService.logout();
    this.router.navigateByUrl('/auth');
  }

  goToHome() {
    this.router.navigateByUrl('/home');
  }
}
