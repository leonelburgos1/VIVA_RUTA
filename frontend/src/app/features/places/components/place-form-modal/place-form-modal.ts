import {
  Component,
  inject,
  Output,
  EventEmitter
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { X, ChevronDown } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { PlaceService } from '../../services/place.service';
import colombiaData from 'colombia-cities/colombia_completa.json';

interface PlaceCategoryOption {
  label: string;
  value: string;
}

interface ColombiaDepartment {
  nombre: string;
  municipios: Array<{ nombre: string }>;
}

interface ColombiaDataFile {
  departamentos: ColombiaDepartment[];
}

@Component({
  selector: 'app-place-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule
  ],
  templateUrl: './place-form-modal.html',
  styleUrl: './place-form-modal.css'
})
export class PlaceFormModal {

  private fb = inject(FormBuilder);
  private placeService = inject(PlaceService);

  @Output() close = new EventEmitter<void>();

  readonly X = X;
  readonly ChevronDown = ChevronDown;

  // ✅ Declarar selectedFile aquí
  selectedFile: File | null = null;

  categories: PlaceCategoryOption[] = [
    { label: 'Naturaleza', value: 'Nature' },
    { label: 'Religioso', value: 'Religious' },
    { label: 'Aventura', value: 'Adventure' },
    { label: 'Cultura', value: 'Culture' },
    { label: 'Playa', value: 'Beach' }
  ];

  municipalities = this.getNarinoMunicipalities();

  placeForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    location: ['', Validators.required],
    category: ['', Validators.required],
    short_description: ['', Validators.required],
    full_description: ['', Validators.required],
    address: ['', Validators.required],
    features: [''],
    // ✅ Quita el campo image del form, los archivos no van aquí
  });

  // ✅ Método que faltaba completamente
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  createPlace(): void {

    if (this.placeForm.invalid) {
      this.placeForm.markAllAsTouched();
      return;
    }

    // ✅ Primero crea el FormData
    const formData = new FormData();

    formData.append('title', this.placeForm.value.title || '');
    formData.append('location', this.placeForm.value.location || '');
    formData.append('category', this.placeForm.value.category || '');
    formData.append('short_description', this.placeForm.value.short_description || '');
    formData.append('full_description', this.placeForm.value.full_description || '');
    formData.append('address', this.placeForm.value.address || '');
    formData.append('rating', '4.8');

    const features = this.placeForm.value.features
      ?.split(',')
      .map((item: string) => item.trim());

    formData.append('features', JSON.stringify(features || []));

    // ✅ Luego agrega la imagen (después de declarar formData)
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.placeService.createPlace(formData).subscribe({
      next: () => {
        alert('Lugar creado correctamente');
        this.close.emit();
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  closeModal(): void {
    this.close.emit();
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
