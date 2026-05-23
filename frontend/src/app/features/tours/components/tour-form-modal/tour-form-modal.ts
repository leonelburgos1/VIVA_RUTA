import {
  Component,
  EventEmitter,
  Output,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ChevronDown,
  LucideAngularModule,
  X
} from 'lucide-angular';

import { PlaceService } from '../../../places/services/place.service';
import { TourService } from '../../services/tour.service';
import { Place } from '../../../../core/models/place.model';

@Component({
  selector: 'app-tour-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule
  ],
  templateUrl: './tour-form-modal.html',
  styleUrl: './tour-form-modal.css'
})
export class TourFormModal {

  private fb = inject(FormBuilder);
  private placeService = inject(PlaceService);
  private tourService = inject(TourService);

  @Output() close = new EventEmitter<boolean>();

  readonly X = X;
  readonly ChevronDown = ChevronDown;

  places: Place[] = [];

  tourForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    place: ['', Validators.required],
    description: ['', Validators.required],
    price: ['', [Validators.required, Validators.min(1)]],
    duration: ['', Validators.required],
    max_spots: ['', [Validators.required, Validators.min(1)]],
    schedule: ['', Validators.required],
    includes: ['', Validators.required],
    image_url: ['']
  });

  constructor() {
    this.loadPlaces();
  }

  private loadPlaces(): void {
    this.placeService.getPlaces().subscribe({
      next: (places) => {
        this.places = places;
      },
      error: (error) => {
        console.error('Error cargando lugares para el tour:', error);
      }
    });
  }

  createTour(): void {

    if (this.tourForm.invalid) {
      this.tourForm.markAllAsTouched();
      return;
    }

    const includes = (this.tourForm.value.includes || '')
      .split(',')
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);

    const payload = {
      ...this.tourForm.value,
      place: Number(this.tourForm.value.place),
      price: Number(this.tourForm.value.price),
      max_spots: Number(this.tourForm.value.max_spots),
      includes,
      rating: 4.8
    };

    this.tourService.createTour(payload).subscribe({
      next: () => {
        alert('Tour creado correctamente');
        this.close.emit(true);
      },
      error: (error) => {
        console.error('Error creando tour:', error);
      }
    });
  }

  closeModal(): void {
    this.close.emit(false);
  }

}
