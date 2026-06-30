import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { PlatformService } from '../../services/ridePlatformService';
import { RidePlatform } from '../../models/ride-platform.model';
import { MatTimepickerModule } from '@angular/material/timepicker';

@Component({
  selector: 'app-ride-form',
  imports: [
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTimepickerModule],
  templateUrl: './ride-form.html',
  styleUrl: './ride-form.scss',
})
export class RideForm {

  platforms: RidePlatform[] = [];

  ride = {
    platforms: '',
    distanceKm: null,
    totalValue: null,
    occurredAt: null,
    notes: ''
  };

  rideDate: Date | null = null;

  rideTime: string = '--:--';

  constructor(
    private router: Router,
    private ridePlatformService: PlatformService
  ) { }

  ngOnInit(): void {
    this.loadPlatforms();
  }

  loadPlatforms(): void {
    console.log('Buscando plataformas...');

    this.ridePlatformService.findAll().subscribe({
      next: (data) => {
        console.log('Plataformas retornadas:', data);
        this.platforms = data;
      },
      error: (error) => {
        console.error('Erro ao buscar plataformas:', error);
      }
    });
  }

  get totalValueFormatted(): string {
    return this.formatCurrency(this.ride.totalValue ?? 0);
  }

  get distanceFormatted(): string {
    const distance = this.ride.distanceKm ?? 0;

    return `${this.formatNumber(distance)} km`;
  }

  get valuePerKm(): number {
    const totalValue = this.ride.totalValue ?? 0;
    const distanceKm = this.ride.distanceKm ?? 0;

    if (distanceKm <= 0) {
      return 0;
    }

    return totalValue / distanceKm;
  }

  get valuePerKmFormatted(): string {
    return `${this.formatCurrency(this.valuePerKm)}/km`;
  }

  get selectedPlatformLabel(): string {
    const platform = this.platforms.find(
      (platform) => platform.value === this.ride.platforms
    );

    return platform?.label ?? '-';
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  private formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

}


