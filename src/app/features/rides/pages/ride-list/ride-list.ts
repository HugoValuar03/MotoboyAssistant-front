import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Ride } from '../../models/ride.model';
import { RideService } from '../../services/ride';

@Component({
  selector: 'app-ride-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ride-list.html',
  styleUrl: './ride-list.scss',
})

export class RideList implements OnInit{

  rides: Ride[] = [];

  constructor(private rideService: RideService){}

  ngOnInit(): void {
    this.loadRides();
  }

  loadRides(): void {
    this.rideService.findAll().subscribe({
      next: (data) => {
        console.log('Corridas Recebidas:', data)
        this.rides = data;
      },
      error: (error) => {
        console.error('Erro ao buscar corridas: ', error);
      },
    })
  }

}
