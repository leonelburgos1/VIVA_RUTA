import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { Navbar } from '../../../../shared/components/navbar/navbar';
import { SearchFilters } from '../../../../shared/components/search-filters/search-filters';
import { PlaceCard } from '../../../../shared/components/place-card/place-card';
import { PlaceService } from '../../services/place.service';
import { Place } from '../../../../core/models/place.model';
import { PlaceFormModal } from '../../components/place-form-modal/place-form-modal';
import { AuthService } from '../../../auth/services/auth.service';


@Component({
  selector: 'app-places',
  standalone: true,
  imports: [
    CommonModule,
    Navbar,
    SearchFilters,
    PlaceCard,
    PlaceFormModal
  ],
  templateUrl: './places.html',
  styleUrl: './places.css'
})
export class Places implements OnInit {

  private placeService = inject(PlaceService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  places: Place[] = [];
  filteredPlaces: Place[] = [];
  showCreateModal = false;
  showSuccessToast = false;
  toastMessage = '';
  selectedCategory = '';
  selectedMunicipality = '';
  searchTerm = '';
  readonly placeCategories = [
    { label: 'Todas las categorías', value: '' },
    { label: 'Naturaleza', value: 'Nature' },
    { label: 'Religioso', value: 'Religious' },
    { label: 'Aventura', value: 'Adventure' },
    { label: 'Cultura', value: 'Culture' },
    { label: 'Gastronomía', value: 'Gastronomy' },
    { label: 'Playa', value: 'Beach' }
  ];
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.loadPlaces();
  }

  loadPlaces(): void {
    this.placeService.getPlaces().subscribe({
      next: (data) => {
        this.places = data;
        this.applyFilters();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      }
    });
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
      this.openSuccessToast(event.message || 'Lugar registrado con éxito');
      this.loadPlaces();
    }
  }

  onFiltersChange(event: {
    category: string;
    municipality: string;
    searchTerm: string;
  }): void {
    this.selectedCategory = event.category;
    this.selectedMunicipality = event.municipality;
    this.searchTerm = event.searchTerm;
    this.applyFilters();
  }

  private applyFilters(): void {
    const normalizedSearch = this.searchTerm.trim().toLowerCase();

    this.filteredPlaces = this.places.filter((place) => {
      const matchesCategory = !this.selectedCategory || place.category === this.selectedCategory;
      const matchesMunicipality = !this.selectedMunicipality || place.location === this.selectedMunicipality;

      const matchesSearch = !normalizedSearch || [
        place.title,
        place.location,
        place.short_description,
        place.category_label,
        ...(place.features || [])
      ].some((value) => value.toLowerCase().includes(normalizedSearch));

      return matchesCategory && matchesMunicipality && matchesSearch;
    });
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
