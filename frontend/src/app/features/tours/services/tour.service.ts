import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Tour } from '../../../core/models/tour.model';

@Injectable({
  providedIn: 'root'
})
export class TourService {

  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000/api/tours/';

  getTours(): Observable<Tour[]> {
    return this.http.get<Tour[]>(this.apiUrl);
  }

  getTourBySlug(slug: string): Observable<Tour> {
    return this.http.get<Tour>(`${this.apiUrl}${slug}/`);
  }

  createTour(payload: Record<string, unknown>): Observable<Tour> {
    return this.http.post<Tour>(this.apiUrl, payload);
  }

}
