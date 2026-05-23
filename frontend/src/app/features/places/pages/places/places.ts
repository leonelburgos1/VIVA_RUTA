import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { Navbar } from '../../../../shared/components/navbar/navbar';
import { PlaceFilters } from '../../components/place-filters/place-filters';
import { PlaceCard } from '../../../../shared/components/place-card/place-card';
import { PlaceService } from '../../services/place.service';
import { Place } from '../../../../core/models/place.model';
import { PlaceFormModal } from '../../components/place-form-modal/place-form-modal';


@Component({
  selector: 'app-places',
  standalone: true,
  imports: [
    CommonModule,
    Navbar,
    PlaceFilters,
    PlaceCard,
    PlaceFormModal
  ],
  templateUrl: './places.html',
  styleUrl: './places.css'
})
export class Places implements OnInit {

  private placeService = inject(PlaceService);
  private cdr = inject(ChangeDetectorRef);

  places: Place[] = [];
  showCreateModal = false;

  ngOnInit(): void {
    this.loadPlaces();
  }

  loadPlaces(): void {
    this.placeService.getPlaces().subscribe({
      next: (data) => {
        this.places = data;
        this.cdr.detectChanges();
        console.log(this.places);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.loadPlaces();
  }

}
