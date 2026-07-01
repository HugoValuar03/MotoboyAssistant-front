import { Component } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { PlatformService } from '../../services/ridePlatformService';
import { RidePlatform } from '../../models/ride-platform.model';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { RideService } from '../../services/rideService';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-ride-form',
  imports: [
    FormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTimepickerModule,
    CommonModule
],
  templateUrl: './ride-form.html',
  styleUrl: './ride-form.scss',
})
export class RideForm {

  platforms: RidePlatform[] = [];

  ride = {
    platforms: '',
    distanceKm: null as number | null,
    totalValue: null as number | null,
    notes: ''
  };

  rideDate: Date | null = null;

  rideTime: Date | null = null;

  rideId: string | null = null;

  isEditMode = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ridePlatformService: PlatformService,
    private rideService: RideService
  ) { }

  ngOnInit(): void {
    this.loadPlatforms();

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.rideId = id;
      this.isEditMode = true;
      this.loadRide(id);
    }
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

  private loadRide(id: string): void {
    this.rideService.findById(id).subscribe({
      next: (ride) => {

        console.log('Corrida retornada pelo backend:', ride);

        const occurredAt = new Date(ride.occurredAt);

        this.ride = {
          platforms: ride.platform,
          distanceKm: ride.distanceKm,
          totalValue: ride.totalValue,
          notes: ride.notes ?? ''
        };

        this.rideDate = occurredAt;
        this.rideTime = occurredAt;
      },
      error: (error) => {
        console.error('Erro ao buscar corrida:', error);
        this.router.navigate(['/corridas']);
      }
    });
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

  private montarRequestCorrida(): RideCreateRequest | null {
    const rideDate = this.rideDate;
    const rideTime = this.rideTime;

    if (!this.ride.platforms) {
      console.error('Selecione uma plataforma');
      return null;
    }

    if (!rideDate) {
      console.error('Informe a data da corrida');
      return null;
    }

    if (!rideTime) {
      console.error('Informe o horário da corrida');
      return null;
    }

    if (!this.ride.distanceKm || this.ride.distanceKm <= 0) {
      console.error('Digite uma distância válida');
      return null;
    }

    if (!this.ride.totalValue || this.ride.totalValue <= 0) {
      console.error('Informe um valor recebido válido');
      return null;
    }

    const occurredAt = this.buildOccurredAt(rideDate, rideTime);

    return {
      platform: this.ride.platforms,
      distanceKm: this.ride.distanceKm,
      totalValue: this.ride.totalValue,
      occurredAt: occurredAt,
      notes: this.ride.notes
    };

  }

  private buildOccurredAt(date: Date, time: Date): string {
    const occurredAt = new Date(date);

    occurredAt.setHours(
      time.getHours(),
      time.getMinutes(),
      0,
      0
    );

    return occurredAt.toISOString();
  }

  protected salvarCorridaRoute() {

    const request = this.montarRequestCorrida();

    if (!request) {
      return;
    }

    if (this.isEditMode && this.rideId) {
      this.rideService.update(this.rideId, request).subscribe({
        next: () => {
          console.log('Corrida atualizada com sucesso');
          this.router.navigate(['/corridas']);
        },
        error: (error) => {
          console.error('Error ao atualizar corrida', error);
        }
      });

      return;
    }

    this.rideService.create(request).subscribe({
      next: () => {
        console.log('Corrida cadastrada com sucesso');
        this.router.navigate(['/corridas']);
      },
      error: (error) => {
        console.error('Erro ao cadastrar corrida', error);
      }
    });

  }

  protected salvarEContinuarRoute() {
    const request = this.montarRequestCorrida();

    if (!request) {
      return;
    }

    this.rideService.create(request).subscribe({
      next: () => {
        console.log('Corrida cadastrada com sucesso');
        this.limparFormulario();
      },
      error: (error) => {
        console.error('Erro ao cadastrar corrida', error);
      }
    });
  }

  private limparFormulario() {
    this.ride = {
      platforms: '',
      distanceKm: null,
      totalValue: null,
      notes: ''
    };

    this.rideDate = null;
    this.rideTime = null;
  }

  protected cancelRoute() {
    this.router.navigate(['/corridas']);
  }

}


