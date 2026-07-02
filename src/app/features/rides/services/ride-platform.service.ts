import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RidePlatform } from '../models/ride-platform.model';

@Injectable({
    providedIn: 'root'
})

export class PlatformService {
    private readonly apiUrl = 'http://localhost:8080/platforms';

    constructor(private http: HttpClient) { }

    findAll(): Observable<RidePlatform[]> {
        return this.http.get<RidePlatform[]>(this.apiUrl);
    }
}

