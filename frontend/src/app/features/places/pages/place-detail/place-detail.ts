import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { ActivatedRoute, Router } from '@angular/router';

import { Navbar } from '../../../../shared/components/navbar/navbar';

import {
  ArrowRight,
  Calendar,
  LucideAngularModule,
  Pencil,
  Trash2,
  Star,
  Clock3,
  MapPin,
  ChevronLeft
} from 'lucide-angular';

import { PlaceService } from '../../services/place.service';
import { Place } from '../../../../core/models/place.model';
import { PlaceFormModal } from '../../components/place-form-modal/place-form-modal';


@Component({
  selector: 'app-place-detail',
  standalone: true,
  imports: [
    CommonModule,
    Navbar,
    LucideAngularModule,
    PlaceFormModal
  ],
  templateUrl: './place-detail.html',
  styleUrl: './place-detail.css'
})
export class PlaceDetail implements OnInit {

  readonly Pencil = Pencil;
  readonly Trash2 = Trash2;
  readonly Star = Star;
  readonly MapPin = MapPin;
  readonly ChevronLeft = ChevronLeft;
  readonly ArrowRight = ArrowRight;
  readonly Calendar = Calendar;
  readonly Clock3 = Clock3;

  place: Place | null = null;
  loading = true;
  showEditModal = false;
  showDeleteConfirm = false;
  showToast = false;
  toastMessage = '';
  isDeleting = false;
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private placeService = inject(PlaceService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (slug) {
      this.loadPlace(slug);
    } else {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  goBack(): void {
    this.router.navigate(['/lugares']);
  }

  goToTour(slug: string): void {
    this.router.navigate(['/tours', slug]);
  }

  openEditModal(): void {
    this.showEditModal = true;
  }

  closeEditModal(event: { reload: boolean; message?: string }): void {
    this.showEditModal = false;

    if (event.reload && this.place) {
      this.openToast(event.message || 'Lugar actualizado con éxito');
      this.loadPlace(this.place.slug);
    }
  }

  requestDeletePlace(): void {
    if (!this.place) return;

    this.showDeleteConfirm = true;
  }

  cancelDeletePlace(): void {
    if (this.isDeleting) {
      return;
    }

    this.showDeleteConfirm = false;
  }

  confirmDeletePlace(): void {
    if (!this.place) return;

    this.isDeleting = true;

    this.placeService.deletePlace(this.place.slug).subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteConfirm = false;
        this.router.navigate(['/lugares']);
      },
      error: (err) => {
        this.isDeleting = false;
        console.error('Error eliminando:', err);
      }
    });
  }

  private loadPlace(slug: string): void {
    this.placeService.getPlaceBySlug(slug).subscribe({
      next: (data) => {
        this.place = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando lugar:', err);
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
