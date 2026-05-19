import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { ActivatedRoute } from '@angular/router';

import { Navbar } from '../../../../shared/components/navbar/navbar';

import { LucideAngularModule, Pencil, Trash2 } from 'lucide-angular';


import {
  Star,
  MapPin,
  ChevronLeft
} from 'lucide-angular';

@Component({
  selector: 'app-place-detail',

  standalone: true,

  imports: [
    CommonModule,
    Navbar,
    LucideAngularModule
  ],

  templateUrl: './place-detail.html',

  styleUrl: './place-detail.css'
})

export class PlaceDetail {

  readonly Pencil = Pencil;

  readonly Trash2 = Trash2;

  readonly Star = Star;

  readonly MapPin = MapPin;

  readonly ChevronLeft = ChevronLeft;

  place = {

    id: 1,

    title: 'Laguna de La Cocha',

    location: 'Pasto, Nariño',

    category: 'Naturaleza',

    rating: 4.8,

    reviews: 124,

    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb',

    description:
      'La Laguna de La Cocha es uno de los destinos turísticos más importantes de Nariño. Rodeada de montañas, naturaleza y paisajes increíbles.',

    features: [
      'Senderismo',
      'Fotografía',
      'Naturaleza',
      'Paseos en lancha'
    ]
  };

  constructor(
    private route: ActivatedRoute
  ) {

    const id =
      this.route.snapshot.paramMap.get('id');

    console.log(id);

  }

}