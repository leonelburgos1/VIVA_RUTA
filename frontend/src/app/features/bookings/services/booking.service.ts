import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../../../core/models/booking.model';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private apiUrl = 'http://127.0.0.1:8000/api/bookings/';

  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl, {
      headers: this.auth.getAuthHeaders()
    });
  }

  createBooking(payload: {
    tour: number;
    date: string;
    guests: number;
    total_price: number;
  }): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, payload, {
      headers: this.auth.getAuthHeaders()
    });
  }

  // llama a /api/bookings/<id>/cancel/ en vez de PATCH directo
  cancelBooking(id: number): Observable<Booking> {
    return this.http.patch<Booking>(
      `${this.apiUrl}${id}/cancel/`,
      {},
      { headers: this.auth.getAuthHeaders() }
    );
  }

}