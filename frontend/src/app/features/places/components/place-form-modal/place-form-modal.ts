import {
  Component,
  EventEmitter,
  Input,
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
  Upload,
  X
} from 'lucide-angular';

import { PlaceService } from '../../services/place.service';
import { Place } from '../../../../core/models/place.model';
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

interface PlaceFormCloseEvent {
  reload: boolean;
  message?: string;
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

  @Input() placeToEdit: Place | null = null;
  @Output() close = new EventEmitter<PlaceFormCloseEvent>();

  readonly X = X;
  readonly ChevronDown = ChevronDown;
  readonly Upload = Upload;

  selectedFile: File | null = null;
  selectedFileName = '';
  isSubmitting = false;

  categories: PlaceCategoryOption[] = [
    { label: 'Naturaleza', value: 'Nature' },
    { label: 'Religioso', value: 'Religious' },
    { label: 'Aventura', value: 'Adventure' },
    { label: 'Cultura', value: 'Culture' },
    { label: 'Gastronomía', value: 'Gastronomy' },
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
    image: [null, Validators.required]
  });

  ngOnInit(): void {
    if (this.placeToEdit) {
      this.patchForm(this.placeToEdit);
      this.placeForm.get('image')?.clearValidators();
      this.placeForm.get('image')?.updateValueAndValidity();
    }
  }

  get isEditMode(): boolean {
    return !!this.placeToEdit;
  }

  get submitLabel(): string {
    return this.isEditMode ? 'Actualizar' : 'Crear Lugar';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedFile = file;
    this.selectedFileName = file?.name ?? '';
    this.placeForm.patchValue({ image: file });
    this.placeForm.get('image')?.markAsTouched();
    this.placeForm.get('image')?.updateValueAndValidity();
  }

  createPlace(): void {

    const requiresImage = !this.isEditMode && !this.selectedFile;

    if (this.placeForm.invalid || requiresImage) {
      this.placeForm.markAllAsTouched();
      this.placeForm.get('image')?.setErrors(
        requiresImage ? { required: true } : null
      );
      return;
    }

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
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);

    formData.append('features', JSON.stringify(features || []));
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.isSubmitting = true;

    const request = this.isEditMode && this.placeToEdit
      ? this.placeService.updatePlace(this.placeToEdit.slug, formData)
      : this.placeService.createPlace(formData);

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.close.emit({
          reload: true,
          message: this.isEditMode
            ? 'Lugar actualizado con éxito'
            : 'Lugar registrado con éxito'
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        console.log(err);
      }
    });
  }

  hasError(controlName: string): boolean {
    const control = this.placeForm.get(controlName);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage(controlName: string): string {
    const control = this.placeForm.get(controlName);

    if (!control?.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio.';
    }

    return 'Revisa este campo.';
  }

  isInvalidFile(): boolean {
    const control = this.placeForm.get('image');
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  closeModal(): void {
    if (this.isSubmitting) {
      return;
    }

    this.close.emit({ reload: false });
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

  private patchForm(place: Place): void {
    this.placeForm.patchValue({
      title: place.title,
      location: place.location,
      category: place.category,
      short_description: place.short_description,
      full_description: place.full_description,
      address: place.address,
      features: (place.features || []).join(', ')
    });
  }
}
