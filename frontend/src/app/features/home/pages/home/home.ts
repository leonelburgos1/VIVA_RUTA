import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Hero } from '../../../../shared/components/hero/hero';
import { PlaceCard } from '../../../../shared/components/place-card/place-card';
import { Categories } from '../../components/categories/categories';
import { FeaturedTours } from '../../components/featured-tours/featured-tours';
import { PlaceService } from '../../../places/services/place.service';
import { Place } from '../../../../core/models/place.model';

@Component({
  selector: 'app-home',

  standalone: true,

  imports: [
    CommonModule,
    Navbar,
    Hero,
    PlaceCard,
    Categories,
    FeaturedTours
  ],

  templateUrl: './home.html',

  styleUrl: './home.css'
})

export class Home implements OnInit {

  private placeService = inject(PlaceService);
  private cdr = inject(ChangeDetectorRef);

  places: Place[] = [];
  loadingPlaces = true;

  ngOnInit(): void {
    this.loadPlaces();
  }

  private loadPlaces(): void {
    this.placeService.getPlaces().subscribe({
      next: (places) => {
        this.places = places;
        this.loadingPlaces = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando lugares destacados:', error);
        this.places = [];
        this.loadingPlaces = false;
        this.cdr.detectChanges();
      }
    });
  }

}
