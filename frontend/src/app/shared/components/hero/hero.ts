import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import {

  LucideAngularModule

} from 'lucide-angular';

@Component({
  selector: 'app-hero',

  standalone: true,

  imports: [
    CommonModule,
    LucideAngularModule
  ],

  templateUrl: './hero.html',

  styleUrl: './hero.css'
})

export class Hero {

}