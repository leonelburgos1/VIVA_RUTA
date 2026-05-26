import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Place } from '../../../core/models/place.model';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PlaceService {

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://127.0.0.1:8000/api/places/';

  getPlaces(): Observable<Place[]> {
    return this.http.get<Place[]>(this.apiUrl);
  }

  getPlaceBySlug(slug: string): Observable<Place> {
    return this.http.get<Place>(`${this.apiUrl}${slug}/`);
  }

  createPlace(data: FormData): Observable<Place> {
    return this.http.post<Place>(this.apiUrl, data, {
      headers: this.authService.getAuthHeaders()
    });
  }

  updatePlace(slug: string, data: FormData): Observable<Place> {
    return this.http.patch<Place>(`${this.apiUrl}${slug}/`, data, {
      headers: this.authService.getAuthHeaders()
    });
  }

  deletePlace(slug: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${slug}/`, {
      headers: this.authService.getAuthHeaders()
    });
  }

}
