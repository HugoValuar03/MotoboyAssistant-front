import { Component } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TopbarFilter } from './shared/services/topbar-filter.service';

@Component({
  selector: 'app-root',
  imports: [
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})

export class App {

  constructor(private router: Router, private topbarFilterService: TopbarFilter) { }

  searchTerm = '';

  applyTopbarFilters(): void {
    this.topbarFilterService.updateFilters({
      searchTerm: this.searchTerm
    });
  }

  clearTopbarFilters(): void {
    this.searchTerm = '';
    this.topbarFilterService.clearFilters();
  }

  goToRides(): void {
    this.router.navigate(['/corridas']);
  }
}
