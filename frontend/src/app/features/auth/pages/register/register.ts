import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { getCitiesByDepartment, getDepartments } from 'colombia-cities';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { AuthService } from '../../services/auth.service';

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
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Navbar],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly departments = getDepartments() as DepartmentOption[];

  departmentSuggestions: DepartmentOption[] = [];
  citySuggestions: string[] = [];
  selectedDepartment: string | null = null;
  isSubmitted = false;

  readonly registerForm = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]],
      confirmPassword: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{7,10}$/)]],
      birthDate: ['', [Validators.required]],
      department: ['', [Validators.required]],
      city: [{ value: '', disabled: true }, [Validators.required]]
    },
    {
      validators: this.passwordsMatchValidator
    }
  );

  readonly minBirthDate = this.getMinBirthDate();
  readonly maxBirthDate = this.getMaxBirthDate();
  phoneHasInvalidCharacters = false;

  feedback: string | null = null;
  isSubmitting = false;

  get departmentControl(): AbstractControl {
    return this.registerForm.get('department') as AbstractControl;
  }

  get cityControl(): AbstractControl {
    return this.registerForm.get('city') as AbstractControl;
  }

  private passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  showFieldError(controlName: string): boolean {
    const control = this.registerForm.get(controlName);

    return !!control && this.isSubmitted && control.invalid;
  }

  getFieldErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);

    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio.';
    }

    if (controlName === 'email' && control.errors['email']) {
      return 'Ingresa un correo válido, incluye el @ y el dominio.';
    }

    if (controlName === 'password' && control.errors['minlength']) {
      return 'La contraseña debe tener al menos 5 caracteres.';
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
    const control = this.registerForm.get('confirmPassword');

    return !!control && this.isSubmitted &&
      (control.invalid || !!this.registerForm.errors?.['passwordMismatch']);
  }

  getConfirmPasswordMessage(): string {
    if (this.registerForm.errors?.['passwordMismatch']) {
      return 'Las contraseñas no coinciden.';
    }

    const control = this.registerForm.get('confirmPassword');

    if (control?.errors?.['required']) {
      return 'Confirma tu contraseña para continuar.';
    }

    return '';
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

  sanitizePhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;

    this.phoneHasInvalidCharacters = /[A-Za-z]/.test(rawValue) || /[^0-9+]/.test(rawValue);
    const sanitized = rawValue.replace(/[^0-9]/g, '');

    input.value = sanitized;
    this.registerForm.get('phone')?.setValue(sanitized, { emitEvent: false });
  }

  private async showSuccessNotification(name: string): Promise<void> {
    const message = `Cuenta creada para ${name}.`;

    if (typeof window === 'undefined') {
      this.feedback = message;
      return;
    }

    this.feedback = message;

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Registro exitoso', { body: message });
        return;
      }

      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
          new Notification('Registro exitoso', { body: message });
          return;
        }
      }
    }

    window.alert(message);
  }

  async onSubmit(): Promise<void> {
    this.isSubmitted = true;
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      this.feedback = null;
      return;
    }

    this.isSubmitting = true;
    this.feedback = null;

    try {
      const payload = this.registerForm.getRawValue();
      const user = await this.authService.registerUser({
        name: payload.name ?? '',
        email: payload.email ?? '',
        password: payload.password ?? '',
        role: 'usuario',
        phone: payload.phone ?? '',
        birthDate: payload.birthDate ?? '',
        department: payload.department ?? '',
        city: payload.city ?? ''
      });

      await this.showSuccessNotification(user.name);
      this.router.navigate(['/']);
    } catch (error) {
      this.feedback = error instanceof Error ? error.message : 'No pudimos crear la cuenta.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
