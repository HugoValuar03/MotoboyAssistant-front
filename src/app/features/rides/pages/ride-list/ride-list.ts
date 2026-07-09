import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Ride } from '../../models/ride.model';
import { RideService } from '../../services/ride.service';
import { SummaryCard } from '../../../dashboard/components/summary-card/summary-card';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialog } from '../../../../shared/components/confirm-dialog/confirm-dialog';

import { TopbarFilter, TopbarFilters } from '../../../../shared/services/topbar-filter.service';

import { Router } from '@angular/router';

import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-ride-list',
  imports: [
    CommonModule,
    FormsModule,
    SummaryCard,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatPaginator
  ],
  templateUrl: './ride-list.html',
  styleUrl: './ride-list.scss',
})

export class RideList implements OnInit {

  totalRecords = 0;
  pageSize = 10;
  page = 0;

  startDate: Date | null = null;
  endDate: Date | null = null;

  Math = Math;

  rides: Ride[] = [];
  filteredRides: Ride[] = [];

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

  topbarFilters: TopbarFilters = {
    searchTerm: '',
    startDate: null,
    endDate: null
  }

  constructor(
    private rideService: RideService,
    private router: Router,
    private dialog: MatDialog,
    private topbarFilterService: TopbarFilter,
    private changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.loadTotalRecords();
    this.loadSummaryCards();

    this.topbarFilterService.filters$.subscribe((filters) => {
      this.topbarFilters = filters;
      this.page = 0;
      this.applyFilters();
    });

    this.loadRides();
  }

  applyDateFilter(): void {
    this.topbarFilterService.updateFilters({
      startDate: this.startDate,
      endDate: this.endDate
    });
  }

  loadRides(page: number = this.page): void {
    this.page = page;

    this.rideService.findAll(this.page, this.pageSize).subscribe({
      next: (data) => {
        this.rides = data;
        this.applyFilters();
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao buscar corridas: ', error);
      },
    });
  }

  loadTotalRecords(): void {
    this.rideService.count().subscribe({
      next: (data) => {
        this.totalRecords = data;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao contar corridas:', error);
      }
    });
  }

  loadSummaryCards(): void {
    this.rideService.summary().subscribe({
      next: (summary) => {
        this.totalRecords = summary.totalRides;

        this.totalDayValue = this.formatCurrency(summary.totalValue);
        this.totalDaySubtitle = `${summary.totalRides} corridas`;

        this.totalWeekValue = String(summary.totalRides);
        this.totalWeekSubtitle = 'Corridas encontradas';

        this.totalWeekKm = `${this.formatNumber(summary.totalDistanceKm)}km`;

        this.averageValuePerKm = `${this.formatCurrency(summary.averageValuePerKm)}/km`;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao carregar resumo:', error);
      }
    });
  }

  paginar(event: PageEvent): void {
    this.page = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadRides();
  }

  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  get dateRangeLabel(): string {
    if (!this.startDate || !this.endDate) {
      return 'Selecionar período';
    }

    return `${this.formatDate(this.startDate)} - ${this.formatDate(this.endDate)}`;
  }

  applyFilters(): void {
    this.filteredRides = this.rides.filter((ride) => {
      const matchesPlatform =
        this.selectedPlatform === 'ALL' || ride.platform === this.selectedPlatform;

      const search = [this.searchTerm, this.topbarFilters.searchTerm]
        .map((term) => term.trim().toLowerCase())
        .filter(Boolean);

      const matchesSearch =
        !search.length ||
        search.every((term) =>
          ride.notes?.toLowerCase().includes(term) ||
          ride.platform.toLowerCase().includes(term)
        );

      const rideDate = this.parseRideDate(ride.occurredAt);

      const startDateSource = this.startDate || this.topbarFilters.startDate;
      const endDateSource = this.endDate || this.topbarFilters.endDate;

      const startDate = startDateSource ? this.getStartOfDay(startDateSource) : null;
      const endDate = endDateSource ? this.getEndOfDay(endDateSource) : null;

      const matchesStartDate = !startDate || (rideDate && rideDate >= startDate);

      const matchesEndDate = !endDate || (rideDate && rideDate <= endDate);

      return matchesPlatform && matchesSearch && matchesStartDate && matchesEndDate;
    });
  }

  clearFilters(): void {
    this.selectedPlatform = 'ALL';
    this.searchTerm = '';
    this.startDate = null;
    this.endDate = null;

    this.topbarFilterService.clearFilters();

    this.applyFilters();
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

  goToForm(): void {
    this.router.navigate(['/corridas/form'])
  }

  goToEdit(id: string): void {
    this.router.navigate(['/corridas', id, 'editar']);
  }

  confirmDelete(ride: Ride): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '420px',
      data: {
        title: 'Excluir corrida',
        message: 'Tem certeza que deseja excluir esta corrida?',
        confirmText: 'Excluir',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) {
        return;
      }

      this.rideService.delete(ride.id).subscribe({
        next: () => {
          this.rides = this.rides.filter((item) => item.id !== ride.id);
          this.applyFilters();
          this.changeDetectorRef.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao excluir corrida:', error);
        }
      });
    });
  }
}
