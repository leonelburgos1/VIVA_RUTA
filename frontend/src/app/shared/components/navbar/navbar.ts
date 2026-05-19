import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {CircleUser, UserRound, LucideAngularModule} from 'lucide-angular';

@Component({
  selector: 'app-navbar',

  standalone: true,

  imports: [CommonModule,RouterModule,LucideAngularModule],

  templateUrl: './navbar.html',

  styleUrl: './navbar.css'
})

export class Navbar {
  readonly CircleUser = CircleUser;
  readonly UserRound = UserRound;

}