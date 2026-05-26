import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';

import {
  ChevronDown,
  LucideAngularModule,
  Upload,
  X
} from 'lucide-angular';

import { PlaceService } from '../../../places/services/place.service';
import { TourService } from '../../services/tour.service';
import { Place } from '../../../../core/models/place.model';
import { Tour } from '../../../../core/models/tour.model';

interface TourFormCloseEvent {
  reload: boolean;
  message?: string;
}

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
export class TourFormModal implements OnChanges {

  private fb = inject(FormBuilder);
  private placeService = inject(PlaceService);
  private tourService = inject(TourService);

  @Input() tourToEdit: Tour | null = null;
  @Output() close = new EventEmitter<TourFormCloseEvent>();

  readonly X = X;
  readonly ChevronDown = ChevronDown;
  readonly Upload = Upload;

  places: Place[] = [];
  selectedFile: File | null = null;
  selectedFileName = '';
  priceDisplay = '';
  isSubmitting = false;

  // ✅ CORREGIDO: los validators son arrow functions para preservar el contexto `this`
  // Con funciones normales (private timeValidator) Angular llama al validator sin contexto
  // y `this` es undefined, causando "Cannot read properties of undefined (reading 'isValidTimeValue')"

  private readonly timeValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = String(control.value ?? '').trim();
    if (!value) return null;
    if (!this.isValidTimeValue(value)) return { invalidTime: true };
    return null;
  };

  private readonly scheduleOrderValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const departureTime   = String(control.get('departure_time')?.value   ?? '').trim();
    const departurePeriod = String(control.get('departure_period')?.value ?? '').trim();
    const returnTime      = String(control.get('return_time')?.value      ?? '').trim();
    const returnPeriod    = String(control.get('return_period')?.value    ?? '').trim();

    if (!departureTime || !departurePeriod || !returnTime || !returnPeriod) return null;
    if (!this.isValidTimeValue(departureTime) || !this.isValidTimeValue(returnTime)) return null;

    const dep = this.toComparableMinutes(departureTime, departurePeriod);
    const ret = this.toComparableMinutes(returnTime, returnPeriod);

    return ret <= dep ? { invalidScheduleOrder: true } : null;
  };

  tourForm: FormGroup = this.fb.group({
    title:            ['', Validators.required],
    place:            ['', Validators.required],
    description:      ['', Validators.required],
    price:            ['', [Validators.required, Validators.min(1)]],
    duration:         ['', Validators.required],
    max_spots:        [1,  [Validators.required, Validators.min(1)]],
    departure_time:   ['', [Validators.required, this.timeValidatorFn]],
    departure_period: ['AM', Validators.required],
    return_time:      ['', [Validators.required, this.timeValidatorFn]],
    return_period:    ['PM', Validators.required],
    includes:         ['', Validators.required],
    image:            [null, Validators.required]
  }, {
    validators: [this.scheduleOrderValidatorFn]
  });

  constructor() {
    this.loadPlaces();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tourToEdit']?.currentValue) {
      this.patchForm(changes['tourToEdit'].currentValue as Tour);
      this.placeFormForEdit();
    }
  }

  get isEditMode(): boolean {
    return !!this.tourToEdit;
  }

  get submitLabel(): string {
    return this.isEditMode ? 'Actualizar' : 'Crear Tour';
  }

  private loadPlaces(): void {
    this.placeService.getPlaces().subscribe({
      next: (places) => { this.places = places; },
      error: (error) => { console.error('Error cargando lugares:', error); }
    });
  }

  onPriceInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value.replace(/\D/g, '');
    const numericValue = rawValue ? Number(rawValue) : null;

    this.priceDisplay = rawValue
      ? new Intl.NumberFormat('es-CO').format(Number(rawValue))
      : '';

    this.tourForm.patchValue({ price: numericValue }, { emitEvent: false });
  }

  onMaxSpotsInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const numericValue = Math.max(0, Number(input.value || 0));
    input.value = String(numericValue);
    this.tourForm.patchValue({ max_spots: numericValue }, { emitEvent: false });
  }

  onTimeInput(controlName: 'departure_time' | 'return_time', event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 4);
    const formattedValue = digits.length > 2
      ? `${digits.slice(0, 2)}:${digits.slice(2)}`
      : digits;

    input.value = formattedValue;
    this.tourForm.patchValue({ [controlName]: formattedValue }, { emitEvent: false });
    this.tourForm.get(controlName)?.updateValueAndValidity();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedFile = file;
    this.selectedFileName = file?.name ?? '';
    this.tourForm.patchValue({ image: file });
    this.tourForm.get('image')?.markAsTouched();
    this.tourForm.get('image')?.updateValueAndValidity();
  }

  createTour(): void {
    const requiresImage = !this.isEditMode && !this.selectedFile;

    if (this.tourForm.invalid || requiresImage) {
      this.tourForm.markAllAsTouched();
      if (requiresImage) {
        this.tourForm.get('image')?.setErrors({ required: true });
      }
      return;
    }

    const includes = (this.tourForm.value.includes || '')
      .split(',')
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);

    const departureTime = `${this.tourForm.value.departure_time} ${this.tourForm.value.departure_period}`;
    const returnTime    = `${this.tourForm.value.return_time} ${this.tourForm.value.return_period}`;
    const schedule      = `Salida ${departureTime} - Retorno ${returnTime}`;

    const formData = new FormData();
    formData.append('title',       this.tourForm.value.title       || '');
    formData.append('place',       String(Number(this.tourForm.value.place)));
    formData.append('description', this.tourForm.value.description || '');
    formData.append('price',       String(Number(this.tourForm.value.price)));
    formData.append('duration',    this.tourForm.value.duration    || '');
    formData.append('max_spots',   String(Number(this.tourForm.value.max_spots)));
    formData.append('schedule',    schedule);
    formData.append('includes',    JSON.stringify(includes));
    formData.append('rating',      '4.8');

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.isSubmitting = true;

    const request = this.isEditMode && this.tourToEdit
      ? this.tourService.updateTour(this.tourToEdit.slug, formData)
      : this.tourService.createTour(formData);

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.close.emit({
          reload: true,
          message: this.isEditMode ? 'Tour actualizado con éxito' : 'Tour registrado con éxito'
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error creando tour:', error);
      }
    });
  }

  hasError(controlName: string): boolean {
    const control = this.tourForm.get(controlName);
    const hasCrossError = (
      controlName === 'return_time' || controlName === 'return_period'
    ) && !!this.tourForm.errors?.['invalidScheduleOrder'];

    return !!control && (
      (control.invalid && (control.touched || control.dirty)) ||
      (hasCrossError && (control.touched || control.dirty))
    );
  }

  getErrorMessage(controlName: string): string {
    const control = this.tourForm.get(controlName);

    if (
      (controlName === 'return_time' || controlName === 'return_period') &&
      !!this.tourForm.errors?.['invalidScheduleOrder']
    ) {
      return 'La hora de retorno debe ser después de la hora de salida.';
    }

    if (!control?.errors) return '';
    if (control.errors['required'])     return 'Este campo es obligatorio.';
    if (control.errors['min'])          return controlName === 'max_spots'
                                          ? 'Los cupos deben ser mayores a 0.'
                                          : 'El valor debe ser mayor a 0.';
    if (control.errors['invalidTime'])  return 'Usa el formato 00:00 con una hora válida.';

    return 'Revisa este campo.';
  }

  isInvalidFile(): boolean {
    const control = this.tourForm.get('image');
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  closeModal(): void {
    if (this.isSubmitting) return;
    this.close.emit({ reload: false });
  }

  // ── Helpers privados ──────────────────────────────────────────────────

  private isValidTimeValue(value: string): boolean {
    const match = /^(\d{2}):(\d{2})$/.exec(value);
    if (!match) return false;
    const hours   = Number(match[1]);
    const minutes = Number(match[2]);
    return hours >= 1 && hours <= 12 && minutes >= 0 && minutes <= 59;
  }

  private toComparableMinutes(time: string, period: string): number {
    const [hoursText, minutesText] = time.split(':');
    let hours = Number(hoursText);
    const minutes = Number(minutesText);
    if (period === 'PM') hours += 12;
    return hours * 60 + minutes;
  }

  private patchForm(tour: Tour): void {
    const dep = this.splitSchedulePart(tour.schedule, 'Salida');
    const ret = this.splitSchedulePart(tour.schedule, 'Retorno');

    this.tourForm.patchValue({
      title:            tour.title,
      place:            String(tour.place),
      description:      tour.description,
      price:            tour.price,
      duration:         tour.duration,
      max_spots:        tour.max_spots,
      departure_time:   this.normalizeTimeValue(dep.time),
      departure_period: dep.period,
      return_time:      this.normalizeTimeValue(ret.time),
      return_period:    ret.period,
      includes:         (tour.includes || []).join(', ')
    });

    this.priceDisplay = new Intl.NumberFormat('es-CO').format(tour.price);
  }

  private placeFormForEdit(): void {
    this.tourForm.get('image')?.clearValidators();
    this.tourForm.get('image')?.updateValueAndValidity();
  }

  private splitSchedulePart(
    schedule: string,
    label: 'Salida' | 'Retorno'
  ): { time: string; period: string } {
    const regex = new RegExp(`${label}\\s(\\d{1,2}:\\d{2})\\s(AM|PM)`);
    const match = schedule.match(regex);
    return {
      time:   match?.[1] ?? '',
      period: match?.[2] ?? (label === 'Salida' ? 'AM' : 'PM')
    };
  }

  private normalizeTimeValue(value: string): string {
    const [h = '', m = ''] = value.split(':');
    if (!h || !m) return value;
    return `${h.padStart(2, '0')}:${m}`;
  }
}