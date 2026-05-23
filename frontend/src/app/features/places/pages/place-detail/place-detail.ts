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


@Component({
  selector: 'app-place-detail',
  standalone: true,
  imports: [
    CommonModule,
    Navbar,
    LucideAngularModule
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

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private placeService = inject(PlaceService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (slug) {
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

  deletePlace(): void {
    if (!this.place) return;

    const confirmed = confirm(
      `¿Estás seguro de que deseas eliminar "${this.place.title}"?`
    );
    if (!confirmed) return;

    this.placeService.deletePlace(this.place.slug).subscribe({
      next: () => {
        alert('Lugar eliminado correctamente');
        this.router.navigate(['/lugares']);
      },
      error: (err) => {
        console.error('Error eliminando:', err);
        alert('Hubo un error al eliminar el lugar');
      }
    });
  }

}
