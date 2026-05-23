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
  Star,
  Users
} from 'lucide-angular';

import { Navbar } from '../../../../shared/components/navbar/navbar';
import { TourService } from '../../services/tour.service';
import { Tour } from '../../../../core/models/tour.model';

@Component({
  selector: 'app-tour-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Navbar,
    LucideAngularModule
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

  tour: Tour | null = null;
  loading = true;
  selectedDate = '';
  peopleCount = 1;

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');

    if (!slug) {
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

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

  goBack(): void {
    this.router.navigate(['/tours']);
  }

  goToPlace(): void {
    if (!this.tour?.place_slug) return;

    this.router.navigate(['/lugares', this.tour.place_slug]);
  }

  get totalPrice(): number {
    return this.tour ? this.tour.price * this.peopleCount : 0;
  }

}
