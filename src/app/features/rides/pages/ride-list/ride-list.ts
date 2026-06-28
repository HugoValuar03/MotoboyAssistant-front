import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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

export class RideList implements OnInit {

  rides: Ride[] = [];
  filteredRides: Ride[] = [];

  selectedPlatform = 'ALL';
  searchTerm = '';
  startDateFilter: Date | null = new Date(2024, 4, 19);
  endDateFilter: Date | null = new Date(2024, 4, 25);

  totalDayValue = 'R$ 0,00';
  totalDaySubtitle = '0 corridas';
  totalWeekValue = 'R$ 0,00';
  totalWeekSubtitle = '0 corridas';
  totalWeekKm = '0 km';
  averageValuePerKm = 'R$ 0,00/km';

  constructor(private rideService: RideService) { }

  ngOnInit(): void {
    this.loadRides();
  }

  loadRides(): void {
    this.rideService.findAll().subscribe({
      next: (data) => {
        this.rides = data;
        this.filteredRides = data;

        this.updateDayCards();
        this.updateWeekCards();
        this.updateWeekKmCards();
        this.updateAverageValuePerKmSummary();
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

      const search = this.searchTerm.trim().toLowerCase();

      const matchesSearch =
        !search ||
        ride.notes?.toLowerCase().includes(search) ||
        ride.platform.toLowerCase().includes(search);

      const rideDate = new Date(ride.occurredAt);

      const startDate = this.startDateFilter ? this.getStartOfDay(this.startDateFilter) : null;

      const endDate = this.endDateFilter ? this.getEndOfDay(this.endDateFilter) : null;

      const matchesStartDate = !startDate || rideDate >= startDate;

      const matchesEndDate = !endDate || rideDate <= endDate;

      return matchesPlatform && matchesSearch && matchesStartDate && matchesEndDate;
    });
  }

  clearFilters(): void {
    this.selectedPlatform = 'ALL';
    this.searchTerm = '';
    this.startDateFilter = null;
    this.endDateFilter = null;
    this.applyFilters();
  }

  private updateDayCards(): void {
    const today = new Date();

    const todayRides = this.rides.filter((ride) => {
      const rideDate = new Date(ride.occurredAt);

      return (
        rideDate.getDate() === today.getDate() &&
        rideDate.getMonth() === today.getMonth() &&
        rideDate.getFullYear() === today.getFullYear()
      );
    });

    const total = todayRides.reduce((sum, ride) => {
      return sum + ride.totalValue;
    }, 0);

    this.totalDayValue = this.formatCurrency(total);
    this.totalDaySubtitle = `${todayRides.length} corridas`;
  }

  private updateWeekCards(): void {
    const today = new Date();

    const startOfWeek = this.getStartOfWeek(today);
    const endOfWeek = this.getEndOfWeek(today);

    const weekRides = this.rides.filter((rides) => {
      const rideDate = new Date(rides.occurredAt);

      return rideDate >= startOfWeek && rideDate <= endOfWeek;
    });

    const total = weekRides.reduce((sum, ride) => {
      return sum + ride.totalValue;
    }, 0);

    this.totalWeekValue = this.formatCurrency(total);
    this.totalWeekSubtitle = `${weekRides.length} corridas`;
  }

  private updateWeekKmCards(): void {
    const today = new Date();

    const startOfWeek = this.getStartOfWeek(today);
    const endOfWeek = this.getEndOfWeek(today);

    const weekRides = this.rides.filter((ride) => {
      const rideDate = new Date(ride.occurredAt);

      return rideDate >= startOfWeek && rideDate <= endOfWeek;
    });

    const totalKm = weekRides.reduce((sum, ride) => {
      return sum + ride.distanceKm;
    }, 0);

    this.totalWeekKm = `${this.formatNumber(totalKm)}km`
  }

  private updateAverageValuePerKmSummary(): void {
    const today = new Date();

    const startOfWeek = this.getStartOfWeek(today);
    const endOfWeek = this.getEndOfWeek(today);

    const weekRides = this.rides.filter((ride) => {
      const rideDate = new Date(ride.occurredAt);

      return rideDate >= startOfWeek && rideDate <= endOfWeek;
    });

    const totalValue = weekRides.reduce((sum, ride) => {
      return sum + ride.totalValue;
    }, 0);

    const totalKm = weekRides.reduce((sum, ride) => {
      return sum + ride.distanceKm;
    }, 0);

    if (totalKm === 0) {
      this.averageValuePerKm = 'R$ 0,00/km';
      return
    }

    const average = totalValue / totalKm;

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

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value);
  }

  private getStartOfWeek(date: Date): Date {
    const currentDate = new Date(date);
    const day = currentDate.getDay();

    const diff = day === 0 ? -6 : 1 - day;

    currentDate.setDate(currentDate.getDate() + diff);
    currentDate.setHours(0, 0, 0, 0);

    return currentDate;
  }

  private getEndOfWeek(date: Date): Date {
    const startOfWeek = this.getStartOfWeek(date);
    const endOfWeek = new Date(startOfWeek);

    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return endOfWeek;
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

    const date = new Date(value);

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}
