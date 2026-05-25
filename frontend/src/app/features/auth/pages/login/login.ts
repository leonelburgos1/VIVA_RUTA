import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Navbar } from '../../../../shared/components/navbar/navbar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, Navbar],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(5)]]
  });

  feedback: string | null = null;
  isSubmitting = false;

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.feedback = 'Completa el correo y la contraseña para continuar.';
      return;
    }

    this.isSubmitting = true;
    this.feedback = null;

    try {
      const payload = this.loginForm.getRawValue();
      const user = await this.authService.loginUser({
        email: payload.email ?? '',
        password: payload.password ?? ''
      });
      this.feedback = `Bienvenido de nuevo, ${user.name}.`;
      this.router.navigate(['/']);
    } catch (error) {
      this.feedback = error instanceof Error ? error.message : 'No pudimos iniciar sesión.';
    } finally {
      this.isSubmitting = false;
    }
  }
}
