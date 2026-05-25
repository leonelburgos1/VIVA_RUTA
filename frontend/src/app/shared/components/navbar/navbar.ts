import { Component, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserRound, LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-navbar',

  standalone: true,

  imports: [CommonModule, RouterModule, LucideAngularModule],

  templateUrl: './navbar.html',

  styleUrl: './navbar.css'
})
export class Navbar {
  private readonly authService = inject(AuthService);

  readonly currentUser$ = this.authService.currentUser$;
  readonly UserRound = UserRound;
}