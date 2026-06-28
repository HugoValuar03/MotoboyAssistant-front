import { Component } from '@angular/core';
import { RideList } from './features/rides/pages/ride-list/ride-list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    RideList,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    RouterLink,
    RouterLinkActive
],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {

  constructor(private router: Router) {}

  searchTerm = '';
  startDate: Date | null = null;
  endDate: Date | null = null;

  clearTopbarFilters(): void {
    this.searchTerm = '';
    this.startDate = null;
    this.endDate = null;
  }

  goToRides(): void {
    this.router.navigate(['/corridas']);
  }

  get dateRangeLabel(): string {
    if (!this.startDate || !this.endDate) {
      return 'Selecionar período';
    }

    return `${this.formatDate(this.startDate)} - ${this.formatDate(this.endDate)}`;
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

}
