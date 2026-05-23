import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  LucideAngularModule,
  Plus,
  Search,
  SlidersHorizontal
} from 'lucide-angular';

import { Navbar } from '../../../../shared/components/navbar/navbar';
import { TourCard } from '../../../../shared/components/tour-card/tour-card';
import { TourFormModal } from '../../components/tour-form-modal/tour-form-modal';
import { TourService } from '../../services/tour.service';
import { Tour } from '../../../../core/models/tour.model';

@Component({
  selector: 'app-tours',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    Navbar,
    TourCard,
    TourFormModal
  ],
  templateUrl: './tours.html',
  styleUrl: './tours.css'
})
export class Tours implements OnInit {

  private tourService = inject(TourService);
  private cdr = inject(ChangeDetectorRef);

  readonly Plus = Plus;
  readonly Search = Search;
  readonly SlidersHorizontal = SlidersHorizontal;

  tours: Tour[] = [];
  filteredTours: Tour[] = [];
  searchTerm = '';
  loadingTours = true;
  showCreateModal = false;

  ngOnInit(): void {
    this.loadTours();
  }

  loadTours(): void {
    this.tourService.getTours().subscribe({
      next: (tours) => {
        this.tours = tours;
        this.applyFilters();
        this.loadingTours = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error cargando tours:', error);
        this.tours = [];
        this.filteredTours = [];
        this.loadingTours = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      this.filteredTours = [...this.tours];
      return;
    }

    this.filteredTours = this.tours.filter((tour) =>
      tour.title.toLowerCase().includes(normalizedSearch) ||
      tour.place_name.toLowerCase().includes(normalizedSearch) ||
      tour.place_location.toLowerCase().includes(normalizedSearch)
    );
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(shouldReload = false): void {
    this.showCreateModal = false;

    if (shouldReload) {
      this.loadingTours = true;
      this.loadTours();
    }
  }

}
