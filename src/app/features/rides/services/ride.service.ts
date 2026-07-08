import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Ride } from '../models/ride.model';
import { RideSummary } from '../models/ride-summary.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RideService {
  private readonly apiUrl = environment.apiUrl + '/api/corridas';

  constructor(private http: HttpClient) { }

  findAll(page: number, pageSize: number): Observable<Ride[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<Ride[]>(this.apiUrl, { params });
  }
  summary(): Observable<RideSummary> {
    return this.http.get<RideSummary>(`${this.apiUrl}/resumo`)
  }

  count(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`)
  }

  findById(id: string): Observable<Ride> {
    return this.http.get<Ride>(`${this.apiUrl}/${id}`);
  }

  create(ride: Partial<Ride>): Observable<Ride> {
    return this.http.post<Ride>(this.apiUrl, ride);
  }

  update(id: string, ride: Partial<Ride>): Observable<Ride> {
    return this.http.put<Ride>(`${this.apiUrl}/${id}`, ride);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
