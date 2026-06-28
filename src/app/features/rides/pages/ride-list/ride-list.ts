import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Ride } from '../../models/ride.model';
import { RideService } from '../../services/ride';
import { SummaryCard } from '../../../dashboard/components/summary-card/summary-card';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-ride-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SummaryCard, MatDatepickerModule, MatFormFieldModule, MatInputModule],
  templateUrl: './ride-list.html',
  styleUrl: './ride-list.scss',
})

export class RideList implements OnInit, OnChanges {

  rides: Ride[] = [];
  filteredRides: Ride[] = [];

  @Input() topbarSearchTerm = '';
  @Input() topbarStartDate: Date | null = null;
  @Input() topbarEndDate: Date | null = null;
  @Output() clearTopbarFilters = new EventEmitter<void>();

  selectedPlatform = 'ALL';
  searchTerm = '';
  startDateFilter: Date | null = null;
  endDateFilter: Date | null = null;

  totalDayValue = 'R$ 0,00';
  totalDaySubtitle = '0 corridas';
  totalWeekValue = '0';
  totalWeekSubtitle = 'corridas encontradas';
  totalWeekKm = '0,0km';
  averageValuePerKm = 'R$ 0,00/km';

  constructor(private rideService: RideService) { }

  ngOnInit(): void {
    this.loadRides();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.rides.length) {
      return;
    }

    if (changes['topbarStartDate'] || changes['topbarEndDate'] || changes['topbarSearchTerm']) {
      this.applyFilters();
    }
  }

  loadRides(): void {
    this.rideService.findAll().subscribe({
      next: (data) => {
        this.rides = data;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Erro ao buscar corridas: ', error);
      },
    });
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  get dateRangeLabel(): string {
    if (!this.startDateFilter || !this.endDateFilter) {
      return 'Selecionar período';
    }

    return `${this.formatDate(this.startDateFilter)} - ${this.formatDate(this.endDateFilter)}`;
  }


  applyFilters(): void {
    this.filteredRides = this.rides.filter((ride) => {
      const matchesPlatform =
        this.selectedPlatform === 'ALL' || ride.platform === this.selectedPlatform;

      const search = [this.searchTerm, this.topbarSearchTerm]
        .map((term) => term.trim().toLowerCase())
        .filter(Boolean);

      const matchesSearch =
        !search.length ||
        search.every((term) =>
          ride.notes?.toLowerCase().includes(term) ||
          ride.platform.toLowerCase().includes(term)
        );

      const rideDate = this.parseRideDate(ride.occurredAt);

      const startDateSource = this.startDateFilter || this.topbarStartDate;
      const endDateSource = this.endDateFilter || this.topbarEndDate;

      const startDate = startDateSource ? this.getStartOfDay(startDateSource) : null;
      const endDate = endDateSource ? this.getEndOfDay(endDateSource) : null;

      const matchesStartDate = !startDate || (rideDate && rideDate >= startDate);

      const matchesEndDate = !endDate || (rideDate && rideDate <= endDate);

      return matchesPlatform && matchesSearch && matchesStartDate && matchesEndDate;
    });

    this.updateSummaryCards();
  }

  clearFilters(): void {
    this.selectedPlatform = 'ALL';
    this.searchTerm = '';
    this.startDateFilter = null;
    this.endDateFilter = null;
    this.clearTopbarFilters.emit();
    this.applyFilters();
  }

  private updateSummaryCards(): void {
    const total = this.filteredRides.reduce((sum, ride) => {
      return sum + ride.totalValue;
    }, 0);

    this.totalDayValue = this.formatCurrency(total);
    this.totalDaySubtitle = `${this.filteredRides.length} corridas`;
    this.totalWeekValue = String(this.filteredRides.length);
    this.totalWeekSubtitle = 'corridas encontradas';

    const totalKm = this.filteredRides.reduce((sum, ride) => {
      return sum + ride.distanceKm;
    }, 0);

    this.totalWeekKm = `${this.formatNumber(totalKm)}km`;

    if (totalKm === 0) {
      this.averageValuePerKm = 'R$ 0,00/km';
      return
    }

    const average = total / totalKm;

    this.averageValuePerKm = `${this.formatCurrency(average)}/km`

  }

  formatPlatform(platform: string): string {
    return platform;
  }

  getPlatformClass(platform: string): string {
    if (platform === 'UBER') {
      return 'uber';
    }

    if (platform === 'IFOOD') {
      return 'ifood';
    }

    return 'default';
  }

  private getStartOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  private getEndOfDay(date: Date): Date {
    const result = new Date(date);
    result.setHours(23, 59, 59, 999);
    return result;
  }

  private parseRideDate(value: string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const parsedDate = new Date(value);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate;
    }

    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:,\s*(\d{2}):(\d{2}))?$/);

    if (!match) {
      return null;
    }

    const [, day, month, year, hour = '0', minute = '0'] = match;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDateTime(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    const date = this.parseRideDate(value);

    if (!date) {
      return '-';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}
