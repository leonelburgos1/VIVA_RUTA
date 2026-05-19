import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { TourCard } from '../../../../shared/components/tour-card/tour-card';

@Component({
  selector: 'app-featured-tours',

  standalone: true,

  imports: [
    CommonModule,
    TourCard
  ],

  templateUrl: './featured-tours.html',

  styleUrl: './featured-tours.css'
})

export class FeaturedTours {

}