import { ChangeDetectorRef, Component } from '@angular/core';

import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { PlatformService } from '../../services/ride-platform.service';
import { RidePlatform } from '../../models/ride-platform.model';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { RideService } from '../../services/ride.service';
import { CommonModule } from '@angular/common';
import { RideCreateRequest } from '../../models/ride-create-request.model';
import { MessageDialog } from '../../../../shared/components/message-dialog/message-dialog';
import { MatDialog } from '@angular/material/dialog';

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
    notes: '',
    occurredAt: '',
    waitingFee: null as number | null,
    tip: null as number | null
  };

  rideDate: string | null = null;

  rideTime: string | null = null;

  rideId: string | null = null;

  isEditMode = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private ridePlatformService: PlatformService,
    private rideService: RideService,
    private dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
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
    this.ridePlatformService.findAll().subscribe({
      next: (data) => {
        this.platforms = data;
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao buscar plataformas:', error);
      }
    });
  }

  get totalValueFormatted(): string {
    const totalValue = (this.ride.totalValue ?? 0) + (this.ride.waitingFee ?? 0) + (this.ride.tip ?? 0);

    return this.formatCurrency(totalValue ?? 0);
  }

  get waitingFeeFormatted(): string {
    const waitingFee = (this.ride.waitingFee ?? 0);

    return this.formatCurrency(waitingFee);
  }

  get tipFormatted(): string {
    const tip = (this.ride.tip ?? 0);

    return this.formatCurrency(tip)
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
        this.ride = {
          platforms: ride.platform,
          distanceKm: ride.distanceKm,
          totalValue: ride.totalValue,
          occurredAt: ride.occurredAt,
          notes: ride.notes ?? '',
          waitingFee: ride.waitingFee ?? 0,
          tip: ride.tip ?? 0
        };

        this.rideDate = this.formatDateFromBackend(ride.occurredAt);
        this.rideTime = this.formatTimeFromBackend(ride.occurredAt);
        this.changeDetectorRef.detectChanges();
      },
      error: (error) => {
        console.error('Erro ao buscar corrida:', error);
        this.router.navigate(['/corridas']);
      }
    });
  }

  private formatDateFromBackend(occuredAt: string): string {
    const [datePart] = occuredAt.split('T');
    const [year, month, day] = datePart.split('-');

    return `${day}/${month}/${year}`;
  }

  private formatTimeFromBackend(occuredAt: string): string {
    const [, timePart] = occuredAt.split('T');

    if (!timePart) {
      return '';
    }

    return timePart.substring(0, 5);
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
      notes: this.ride.notes,
      waitingFee: (this.ride.waitingFee ?? 0),
      tip: (this.ride.tip ?? 0)
    };

  }

  private buildOccurredAt(date: string, time: string): string {
    const [day, month, year] = date.split('/');
    const [hours, minutes] = time.split(':');

    return `${year}-${month}-${day}T${hours}:${minutes}:00`;
  }

  protected formatDateInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    let value = input.value.replace(/\D/g, '');

    if (value.length > 8) {
      value = value.substring(0, 8);
    }

    if (value.length > 4) {
      value = value.replace(/(\d{2})(\d{2})(\d{1,4})/, '$1/$2/$3');
    } else if (value.length > 2) {
      value = value.replace(/(\d{2})(\d{1,2})/, '$1/$2');
    }

    input.value = value;

    this.rideDate = value;
  }

  protected formatTimeInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    let value = input.value.replace(/\D/g, '');

    if (value.length > 4) {
      value = value.substring(0, 4);
    }

    if (value.length >= 2) {
      let hour = Number(value.substring(0, 2));

      if (hour > 23) {
        hour = 23;
      }

      value = hour.toString().padStart(2, '0') + value.substring(2);
    }

    if (value.length >= 4) {
      let minute = Number(value.substring(2, 4));

      if (minute > 59) {
        minute = 59;
      }

      value = value.substring(0, 2) + minute.toString().padStart(2, '0');
    }

    if (value.length > 2) {
      value = value.replace(/(\d{2})(\d{1,2})/, '$1:$2');
    }

    input.value = value;
    this.rideTime = value;
  }

  protected salvarCorridaRoute() {

    const request = this.montarRequestCorrida();

    if (!request) {
      return;
    }

    if (this.isEditMode && this.rideId) {
      this.rideService.update(this.rideId, request).subscribe({
        next: () => {
          this.dialog.open(MessageDialog, {
            width: '420px',
            data: {
              message: 'Corrida excluída com sucesso.'
            }
          });
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
        this.dialog.open(MessageDialog, {
          width: '420px',
          data: {
            message: 'Corrida cadastrada com sucesso.'
          }
        });
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
        this.dialog.open(MessageDialog, {
          width: '420px',
          data: {
            message: 'Corrida cadastrada com sucesso.'
          }
        });
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
      notes: '',
      occurredAt: '',
      waitingFee: null,
      tip: null
    };

    this.rideDate = null;
    this.rideTime = null;
  }

  protected cancelRoute() {
    this.router.navigate(['/corridas']);
  }

}


