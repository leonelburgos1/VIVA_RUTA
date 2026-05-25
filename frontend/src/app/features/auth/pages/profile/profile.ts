import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { getCitiesByDepartment, getDepartments } from 'colombia-cities';
import { LucideAngularModule, Pen, Trash2, UserRound } from 'lucide-angular';
import { AuthService } from '../../services/auth.service';
import { AuthUser } from '../../../../core/models/auth-user.model';
import { Navbar } from '../../../../shared/components/navbar/navbar';

type DepartmentOption = {
  id: number;
  nombre: string;
  totalMunicipios: number;
};

type CityOption = {
  codigo: string;
  nombre: string;
  departamento: string;
};

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule, Navbar],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfilePage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly currentUser$ = this.authService.currentUser$;
  readonly UserRound = UserRound;
  readonly Pen = Pen;
  readonly Trash2 = Trash2;

  readonly departments = getDepartments() as DepartmentOption[];
  departmentSuggestions: DepartmentOption[] = [];
  citySuggestions: string[] = [];
  selectedDepartment: string | null = null;

  readonly minBirthDate = this.getMinBirthDate();
  readonly maxBirthDate = this.getMaxBirthDate();
  phoneHasInvalidCharacters = false;

  showDeleteConfirm = false;
  showEditProfile = false;
  isSavingEdit = false;
  editFeedback: string | null = null;
  isSubmitted = false;

  readonly editForm = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(5)]],
      confirmNewPassword: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,10}$/)]],
      birthDate: ['', [Validators.required]],
      department: ['', [Validators.required]],
      city: [{ value: '', disabled: true }, [Validators.required]]
    },
    {
      validators: this.newPasswordsMatchValidator
    }
  );

  get departmentControl(): AbstractControl {
    return this.editForm.get('department') as AbstractControl;
  }

  get cityControl(): AbstractControl {
    return this.editForm.get('city') as AbstractControl;
  }

  formatBirthDate(value: string): string {
    if (!value) {
      return 'No registrado';
    }

    const [year, month, day] = value.split('-');

    if (!year || !month || !day) {
      return value;
    }

    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day), 12);

    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(parsedDate);
  }

  editProfile(): void {
    const currentUser = this.authService.currentUser;

    if (!currentUser) {
      return;
    }

    this.selectedDepartment = currentUser.department;
    this.departmentSuggestions = [];
    this.citySuggestions = [];
    this.phoneHasInvalidCharacters = false;
    this.editFeedback = null;
    this.isSubmitted = false;
    this.showEditProfile = true;

    this.editForm.reset({
      name: currentUser.name,
      email: currentUser.email,
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
      phone: currentUser.phone,
      birthDate: currentUser.birthDate,
      department: currentUser.department,
      city: currentUser.city
    });

    this.cityControl.enable({ emitEvent: false });
    this.loadCitySuggestions(currentUser.department);
  }

  closeEditProfile(): void {
    this.showEditProfile = false;
    this.isSubmitted = false;
    this.editFeedback = null;
    this.editForm.reset();
    this.citySuggestions = [];
    this.departmentSuggestions = [];
    this.selectedDepartment = null;
  }

  onDepartmentInput(): void {
    const value = (this.departmentControl.value ?? '').toString().trim().toLowerCase();
    const matchedDepartment = this.departments.find((department) => department.nombre.toLowerCase() === value);

    this.departmentSuggestions = this.departments
      .filter((department) => department.nombre.toLowerCase().startsWith(value))
      .slice(0, 8);

    this.selectedDepartment = matchedDepartment?.nombre ?? null;

    if (matchedDepartment) {
      this.cityControl.enable({ emitEvent: false });
      this.cityControl.setValue('', { emitEvent: false });
      this.loadCitySuggestions(matchedDepartment.nombre);
      return;
    }

    this.cityControl.disable({ emitEvent: false });
    this.cityControl.setValue('', { emitEvent: false });
    this.citySuggestions = [];
  }

  onDepartmentSelect(departmentName: string): void {
    this.departmentControl.setValue(departmentName);
    this.selectedDepartment = departmentName;
    this.departmentSuggestions = [];
    this.cityControl.enable({ emitEvent: false });
    this.cityControl.setValue('', { emitEvent: false });
    this.loadCitySuggestions(departmentName);
  }

  onCityInput(): void {
    if (!this.selectedDepartment) {
      this.citySuggestions = [];
      return;
    }

    const value = (this.cityControl.value ?? '').toString().trim().toLowerCase();
    this.citySuggestions = getCitiesByDepartment(this.selectedDepartment)
      .map((city: CityOption) => city.nombre)
      .filter((cityName) => cityName.toLowerCase().startsWith(value))
      .slice(0, 8);
  }

  onCitySelect(cityName: string): void {
    this.cityControl.setValue(cityName);
    this.citySuggestions = [];
  }

  sanitizePhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;

    this.phoneHasInvalidCharacters = /[A-Za-z]/.test(rawValue) || /[^0-9+]/.test(rawValue);
    const sanitized = rawValue.replace(/[^0-9]/g, '');

    input.value = sanitized;
    this.editForm.get('phone')?.setValue(sanitized, { emitEvent: false });
  }

  showFieldError(controlName: string): boolean {
    const control = this.editForm.get(controlName);

    return !!control && this.isSubmitted && control.invalid;
  }

  getFieldErrorMessage(controlName: string): string {
    const control = this.editForm.get(controlName);

    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio.';
    }

    if (controlName === 'email' && control.errors['email']) {
      return 'Ingresa un correo válido, incluye el @ y el dominio.';
    }

    if ((controlName === 'newPassword' || controlName === 'currentPassword') && control.errors['minlength']) {
      return 'La contraseña debe tener al menos 5 caracteres.';
    }

    if (controlName === 'currentPassword' && control.errors['invalidCurrentPassword']) {
      return 'La contraseña anterior es incorrecta.';
    }

    if (controlName === 'phone') {
      if (this.phoneHasInvalidCharacters) {
        return 'Ingresa solo el número de teléfono, sin letras ni caracteres especiales.';
      }

      if (control.errors['pattern']) {
        return 'El teléfono debe tener entre 7 y 10 dígitos.';
      }
    }

    if (controlName === 'name' && control.errors['minlength']) {
      return 'El nombre debe tener al menos 2 caracteres.';
    }

    return 'Revisa este campo.';
  }

  showConfirmPasswordError(): boolean {
    const control = this.editForm.get('confirmNewPassword');

    return !!control && this.isSubmitted && (control.invalid || !!this.editForm.errors?.['passwordMismatch']);
  }

  getConfirmPasswordMessage(): string {
    if (this.editForm.errors?.['passwordMismatch']) {
      return 'Las nuevas contraseñas no coinciden.';
    }

    const control = this.editForm.get('confirmNewPassword');

    if (control?.errors?.['required']) {
      return 'Confirma tu nueva contraseña para continuar.';
    }

    return '';
  }

  clearCurrentPasswordError(): void {
    const control = this.editForm.get('currentPassword');

    if (!control) {
      return;
    }

    if (control.errors?.['invalidCurrentPassword']) {
      const { invalidCurrentPassword, ...restErrors } = control.errors;
      control.setErrors(Object.keys(restErrors).length ? restErrors : null);
    }
  }

  showCityDepartmentMessage(): boolean {
    return this.isSubmitted && !this.selectedDepartment;
  }

  getCityDepartmentMessage(): string {
    if (!this.selectedDepartment) {
      return 'Selecciona primero un departamento para poder elegir la ciudad.';
    }

    if (this.showFieldError('city')) {
      return 'Selecciona tu ciudad.';
    }

    return '';
  }

  private newPasswordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmNewPassword = control.get('confirmNewPassword')?.value;

    if (!newPassword || !confirmNewPassword) {
      return null;
    }

    return newPassword === confirmNewPassword ? null : { passwordMismatch: true };
  }

  private loadCitySuggestions(departmentName: string): void {
    this.citySuggestions = getCitiesByDepartment(departmentName)
      .map((city: CityOption) => city.nombre)
      .slice(0, 8);
  }

  private getMinBirthDate(): string {
    const now = new Date();
    const year = now.getFullYear() - 100;

    return `${year}-01-01`;
  }

  private getMaxBirthDate(): string {
    const now = new Date();
    const year = now.getFullYear();

    return `${year}-12-31`;
  }

  async saveProfileChanges(): Promise<void> {
    this.isSubmitted = true;
    this.editForm.markAllAsTouched();
    this.editFeedback = null;

    const currentUser = this.authService.currentUser;

    if (!currentUser) {
      return;
    }

    const currentPassword = this.editForm.get('currentPassword')?.value ?? '';
    const storedPassword = this.authService.getStoredPasswordById(currentUser.id);

    if (storedPassword !== currentPassword) {
      this.editForm.get('currentPassword')?.setErrors({ invalidCurrentPassword: true });
      this.editForm.markAllAsTouched();
      return;
    }

    if (this.editForm.invalid) {
      return;
    }

    this.isSavingEdit = true;

    try {
      const payload = this.editForm.getRawValue();
      const newPassword = payload.newPassword ?? '';

      this.authService.updateCurrentUser({
        id: currentUser.id,
        name: payload.name ?? '',
        email: payload.email ?? '',
        password: newPassword || storedPassword || '',
        role: currentUser.role,
        phone: payload.phone ?? '',
        birthDate: payload.birthDate ?? '',
        department: payload.department ?? '',
        city: payload.city ?? ''
      });

      this.editFeedback = 'Cambios guardados.';
      this.closeEditProfile();
    } catch (error) {
      this.editFeedback = error instanceof Error ? error.message : 'No pudimos guardar los cambios.';
    } finally {
      this.isSavingEdit = false;
    }
  }

  openDeleteConfirm(): void {
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  confirmDelete(): void {
    this.authService.deleteCurrentUser();
    this.showDeleteConfirm = false;
    this.router.navigate(['/']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
