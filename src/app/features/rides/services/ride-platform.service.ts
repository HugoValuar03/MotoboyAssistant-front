import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RidePlatform } from '../models/ride-platform.model';
import { environment } from '../../../../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class PlatformService {
    private readonly apiUrl = environment.apiUrl + '/platforms';

    constructor(private http: HttpClient) { }

    findAll(): Observable<RidePlatform[]> {
        return this.http.get<RidePlatform[]>(this.apiUrl);
    }
}

