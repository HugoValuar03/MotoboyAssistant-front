import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ride } from '../models/ride.model';

@Injectable({
  providedIn: 'root',
})
export class RideService {
  private readonly apiUrl = 'http://localhost:8080/api/corridas';

  constructor(private http: HttpClient){}

  findAll(): Observable<Ride[]> {
    return this.http.get<Ride[]>(this.apiUrl);
  }

  findById(id: string): Observable<Ride> {
    return this.http.get<Ride>(`${this.apiUrl}/${id}`);
  }

  create(ride: Partial<Ride>): Observable<Ride> {
    return this.http.post<Ride>(this.apiUrl, ride);
  }

  update(id: string,ride: Partial<Ride>): Observable<Ride> {
    return this.http.put<Ride>(`${this.apiUrl}/${id}`, ride);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
