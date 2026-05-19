import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  Search,
  ChevronDown,
  LucideAngularModule
} from 'lucide-angular';

@Component({
  selector: 'app-place-filters',

  standalone: true,

  imports: [CommonModule,LucideAngularModule],

  templateUrl: './place-filters.html',

  styleUrl: './place-filters.css'
})

export class PlaceFilters {

  categories = [
    'Todas las categorías',
    'Naturaleza',
    'Religioso',
    'Aventura',
    'Cultura',
    'Playa'
  ];

  municipalities = [
    'Todos los municipios',
    'Pasto',
    'Ipiales',
    'Tumaco',
    'La Cruz'
  ];

  readonly Search = Search;

  readonly ChevronDown = ChevronDown;
}