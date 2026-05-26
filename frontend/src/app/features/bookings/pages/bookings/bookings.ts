import {
  Component,
  OnInit,
  inject,
  PLATFORM_ID
} from '@angular/core';

import { isPlatformBrowser, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import {
  LucideAngularModule,
  Clock3,
  MapPin,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Star
} from 'lucide-angular';

import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Booking } from '../../../../core/models/booking.model';
import { BookingService } from '../../services/booking.service';


@Component({
  selector: 'page-bookings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Navbar,
    LucideAngularModule
  ],
  templateUrl: './bookings.html',
  styleUrls: ['./bookings.css']
})
export class BookingsPage implements OnInit {

  readonly Clock3 = Clock3;
  readonly MapPin = MapPin;
  readonly Users = Users;
  readonly Calendar = Calendar;
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly Clock = Clock;
  readonly Star = Star;

  bookings: Booking[] = [];
  loading = true;

  private bookingService = inject(BookingService);
  private platformId = inject(PLATFORM_ID);

  // ─── Contadores computados como getters (Angular no permite .filter() en templates) ───
  get pendingCount(): number {
    return this.bookings.filter(b => b.status === 'pending').length;
  }

  get confirmedCount(): number {
    return this.bookings.filter(b => b.status === 'confirmed').length;
  }

  get completedCount(): number {
    return this.bookings.filter(b => b.status === 'completed').length;
  }

  get cancelledCount(): number {
    return this.bookings.filter(b => b.status === 'cancelled').length;
  }

  ngOnInit(): void {
    // Solo cargar en el browser, evitar bug SSR
    if (isPlatformBrowser(this.platformId)) {
      this.loadBookings();
    }
  }

  loadBookings(): void {
    this.loading = true;
    this.bookingService.getMyBookings().subscribe({
      next: (data) => {
        this.bookings = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  cancel(b: Booking): void {
    const confirmed = confirm(`¿Cancelar la reserva de "${b.tour_title}"?`);
    if (!confirmed) return;

    this.bookingService.cancelBooking(b.id).subscribe({
      next: () => this.loadBookings()
    });
  }

  // Etiqueta para el estado
  getStatusLabel(status: Booking['status']): string {
    const labels: Record<Booking['status'], string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };
    return labels[status] ?? status;
  }

  // Fallback de imagen
  getFallbackImage(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80';
  }

}