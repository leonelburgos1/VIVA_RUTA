import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { TourCard } from '../../../../shared/components/tour-card/tour-card';
import { TourService } from '../../../tours/services/tour.service';
import { Tour } from '../../../../core/models/tour.model';

@Component({
  selector: 'app-featured-tours',

  standalone: true,

  imports: [
    CommonModule,
    TourCard
  ],

  templateUrl: './featured-tours.html',

  styleUrl: './featured-tours.css'
})

export class FeaturedTours implements OnInit {

  private tourService = inject(TourService);
  private cdr = inject(ChangeDetectorRef);

  tours: Tour[] = [];
  loadingTours = true;

  ngOnInit(): void {
    this.tourService.getTours().subscribe({
      next: (tours) => {
        this.tours = tours.slice(0, 2);
        this.loadingTours = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando tours destacados:', error);
        this.tours = [];
        this.loadingTours = false;
        this.cdr.detectChanges();
      }
    });
  }

}
