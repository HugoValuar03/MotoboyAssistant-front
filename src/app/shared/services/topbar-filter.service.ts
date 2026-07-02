import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TopbarFilters {
  searchTerm: string;
  startDate: Date | null;
  endDate: Date | null;
}

@Injectable({
  providedIn: 'root',
})

export class TopbarFilter {
  private readonly filtersSubject = new BehaviorSubject<TopbarFilters>({
    searchTerm: '',
    startDate: null,
    endDate: null
  });

  filters$ = this.filtersSubject.asObservable();

  updateFilters(filters: Partial<TopbarFilters>): void {
    this.filtersSubject.next({
      ...this.filtersSubject.value,
      ...filters
    })
  }

  clearFilters(): void {
    this.filtersSubject.next({
      searchTerm: '',
      startDate: null,
      endDate: null
    });
  }

}
