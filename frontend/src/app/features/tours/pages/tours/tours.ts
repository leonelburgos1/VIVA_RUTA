import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  LucideAngularModule,
  Plus
} from 'lucide-angular';

import { Navbar } from '../../../../shared/components/navbar/navbar';
import { SearchFilters } from '../../../../shared/components/search-filters/search-filters';
import { TourCard } from '../../../../shared/components/tour-card/tour-card';
import { TourFormModal } from '../../components/tour-form-modal/tour-form-modal';
import { TourService } from '../../services/tour.service';
import { Tour } from '../../../../core/models/tour.model';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-tours',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    Navbar,
    SearchFilters,
    TourCard,
    TourFormModal
  ],
  templateUrl: './tours.html',
  styleUrl: './tours.css'
})
export class Tours implements OnInit {

  private tourService = inject(TourService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  readonly Plus = Plus;

  tours: Tour[] = [];
  filteredTours: Tour[] = [];
  searchTerm = '';
  loadingTours = true;
  showCreateModal = false;
  showSuccessToast = false;
  toastMessage = '';
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

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
      tour.place_location.toLowerCase().includes(normalizedSearch) ||
      tour.description.toLowerCase().includes(normalizedSearch)
    );
  }

  onFiltersChange(event: {
    category: string;
    municipality: string;
    searchTerm: string;
  }): void {
    this.searchTerm = event.searchTerm;
    this.applyFilters();
  }

  openCreateModal(): void {
    if (!this.isAdmin) {
      return;
    }
    this.showCreateModal = true;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin;
  }

  closeCreateModal(event: { reload: boolean; message?: string }): void {
    this.showCreateModal = false;

    if (event.reload) {
      this.openSuccessToast(event.message || 'Tour registrado con éxito');
      this.loadingTours = true;
      this.loadTours();
    }
  }

  private openSuccessToast(message: string): void {
    this.toastMessage = message;
    this.showSuccessToast = true;

    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }

    this.toastTimeoutId = setTimeout(() => {
      this.showSuccessToast = false;
      this.cdr.detectChanges();
    }, 3200);
  }

}
