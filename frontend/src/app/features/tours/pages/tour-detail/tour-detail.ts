import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
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

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private tourService = inject(TourService);
  private cdr = inject(ChangeDetectorRef);

  readonly ChevronLeft = ChevronLeft;
  readonly MapPin = MapPin;
  readonly Clock3 = Clock3;
  readonly Users = Users;
  readonly Star = Star;
  readonly Calendar = Calendar;
  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;

  tour: Tour | null = null;
  loading = true;
  selectedDate = '';
  peopleCount = 1;
  showEditModal = false;
  showToast = false;
  toastMessage = '';
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.loadTour(slug);
  }

  goBack(): void {
    this.router.navigate(['/tours']);
  }

  goToPlace(): void {
    if (!this.tour?.place_slug) return;

    this.router.navigate(['/lugares', this.tour.place_slug]);
  }

  openEditModal(): void {
    this.showEditModal = true;
  }

  closeEditModal(event: { reload: boolean; message?: string }): void {
    this.showEditModal = false;

    if (event.reload && this.tour) {
      this.openToast(event.message || 'Tour actualizado con éxito');
      this.loadTour(this.tour.slug);
    }
  }

  deleteTour(): void {
    if (!this.tour) return;

    const confirmed = confirm(
      `¿Estás seguro de que deseas eliminar "${this.tour.title}"?`
    );
    if (!confirmed) return;

    this.tourService.deleteTour(this.tour.slug).subscribe({
      next: () => {
        this.router.navigate(['/tours']);
      },
      error: (error) => {
        console.error('Error eliminando tour:', error);
      }
    });
  }

  get totalPrice(): number {
    return this.tour ? this.tour.price * this.peopleCount : 0;
  }

  private loadTour(slug: string): void {
    this.tourService.getTourBySlug(slug).subscribe({
      next: (tour) => {
        this.tour = tour;
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
    this.showToast = true;

    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }

    this.toastTimeoutId = setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 3200);
  }

}
