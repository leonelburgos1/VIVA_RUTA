import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
  PLATFORM_ID
} from '@angular/core';

import { isPlatformBrowser, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  Calendar,
  ChevronLeft,
  Clock3,
  LucideAngularModule,
  MapPin,
  Pencil,
  Star,
  Trash2,
  Users
} from 'lucide-angular';

import { Navbar } from '../../../../shared/components/navbar/navbar';
import { TourService } from '../../services/tour.service';
import { BookingService } from '../../../bookings/services/booking.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Tour } from '../../../../core/models/tour.model';
import { TourFormModal } from '../../components/tour-form-modal/tour-form-modal';

@Component({
  selector: 'app-tour-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Navbar,
    LucideAngularModule,
    TourFormModal
  ],
  templateUrl: './tour-detail.html',
  styleUrl: './tour-detail.css'
})
export class TourDetail implements OnInit {

  private route        = inject(ActivatedRoute);
  private router       = inject(Router);
  private tourService  = inject(TourService);
  private bookingService = inject(BookingService);
  private authService  = inject(AuthService);
  private cdr          = inject(ChangeDetectorRef);
  private platformId   = inject(PLATFORM_ID);

  readonly ChevronLeft = ChevronLeft;
  readonly MapPin      = MapPin;
  readonly Clock3      = Clock3;
  readonly Users       = Users;
  readonly Star        = Star;
  readonly Calendar    = Calendar;
  readonly Pencil      = Pencil;
  readonly Trash2      = Trash2;

  tour: Tour | null = null;
  loading          = true;
  selectedDate     = '';
  peopleCount      = 1;
  showEditModal    = false;
  showToast        = false;
  toastMessage     = '';
  bookingCreating  = false;

  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    // ✅ Solo cargar en el browser (evita bug SSR)
    if (!isPlatformBrowser(this.platformId)) {
      this.loading = false;
      return;
    }

    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) { this.loading = false; return; }
    this.loadTour(slug);
  }

  goBack(): void { this.router.navigate(['/tours']); }

  goToPlace(): void {
    if (this.tour?.place_slug) {
      this.router.navigate(['/lugares', this.tour.place_slug]);
    }
  }

  openEditModal():  void { this.showEditModal = true; }

  closeEditModal(event: { reload: boolean; message?: string }): void {
    this.showEditModal = false;
    if (event.reload && this.tour) {
      this.openToast(event.message || 'Tour actualizado con éxito');
      this.loadTour(this.tour.slug);
    }
  }

  deleteTour(): void {
    if (!this.tour) return;
    if (!confirm(`¿Eliminar "${this.tour.title}"?`)) return;

    this.tourService.deleteTour(this.tour.slug).subscribe({
      next:  () => this.router.navigate(['/tours']),
      error: (e) => console.error('Error eliminando tour:', e)
    });
  }

  get totalPrice(): number {
    return this.tour ? this.tour.price * this.peopleCount : 0;
  }

  // ✅ Solo usuarios normales autenticados pueden reservar (no admins)
  get canBook(): boolean {
    return this.authService.isAuthenticated && !this.authService.isAdmin;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  reserveNow(): void {
    if (!this.tour) return;

    if (!this.selectedDate) {
      this.openToast('Por favor selecciona una fecha.');
      return;
    }

    this.bookingCreating = true;

    this.bookingService.createBooking({
      tour:        this.tour.id,
      date:        this.selectedDate,
      guests:      this.peopleCount,
      total_price: this.totalPrice
    }).subscribe({
      next: () => {
        this.bookingCreating = false;
        // navegar a /reservas para que el usuario vea su reserva
        this.router.navigate(['/reservas']);
      },
      error: (error) => {
        console.error('Error al crear reserva:', error);
        this.openToast('No se pudo crear la reserva. Intenta de nuevo.');
        this.bookingCreating = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadTour(slug: string): void {
    this.tourService.getTourBySlug(slug).subscribe({
      next: (tour) => {
        this.tour    = tour;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando tour:', error);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private openToast(message: string): void {
    this.toastMessage = message;
    this.showToast    = true;

    if (this.toastTimeoutId) clearTimeout(this.toastTimeoutId);

    this.toastTimeoutId = setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 3200);
  }
}