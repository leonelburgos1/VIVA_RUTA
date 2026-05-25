import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Search,
  ChevronDown,
  LucideAngularModule
} from 'lucide-angular';

import colombiaData from 'colombia-cities/colombia_completa.json';

interface ColombiaDepartment {
  nombre: string;
  municipios: Array<{ nombre: string }>;
}

interface ColombiaDataFile {
  departamentos: ColombiaDepartment[];
}

interface FilterOption {
  label: string;
  value: string;
}

interface SearchFiltersChangeEvent {
  category: string;
  municipality: string;
  searchTerm: string;
}

@Component({
  selector: 'app-search-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './search-filters.html',
  styleUrl: './search-filters.css'
})
export class SearchFilters {

  @Input() searchPlaceholder = 'Buscar...';
  @Input() showCategoryFilter = false;
  @Input() showMunicipalityFilter = false;
  @Input() categories: FilterOption[] = [];
  @Input() municipalities: FilterOption[] = [];
  @Output() filtersChange = new EventEmitter<SearchFiltersChangeEvent>();

  readonly Search = Search;
  readonly ChevronDown = ChevronDown;

  searchTerm = '';
  selectedCategory = '';
  selectedMunicipality = '';

  readonly defaultMunicipalities = [
    { label: 'Todos los municipios', value: '' },
    ...this.getNarinoMunicipalities().map((municipality) => ({
      label: municipality,
      value: municipality
    }))
  ];

  emitFilters(): void {
    this.filtersChange.emit({
      category: this.selectedCategory,
      municipality: this.selectedMunicipality,
      searchTerm: this.searchTerm
    });
  }

  get municipalityOptions(): FilterOption[] {
    return this.municipalities.length > 0
      ? this.municipalities
      : this.defaultMunicipalities;
  }

  private getNarinoMunicipalities(): string[] {
    const data = colombiaData as ColombiaDataFile;
    const narinoDepartment = data.departamentos.find(
      (department) => department.nombre.toLowerCase() === 'nariño'
    );

    if (!narinoDepartment) {
      return [];
    }

    return narinoDepartment.municipios
      .map((city) => city.nombre)
      .sort((a, b) => a.localeCompare(b, 'es'));
  }
}
