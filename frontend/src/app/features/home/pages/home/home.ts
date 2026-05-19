import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

import { Navbar } from '../../../../shared/components/navbar/navbar';
import { Hero } from '../../../../shared/components/hero/hero';
import { PlaceCard } from '../../../../shared/components/place-card/place-card';
import { StatsCard } from '../../../../shared/components/stats-card/stats-card';
import { Categories } from '../../components/categories/categories';
import { FeaturedTours } from '../../components/featured-tours/featured-tours';

@Component({
  selector: 'app-home',

  standalone: true,

  imports: [
    CommonModule,
    Navbar,
    Hero,
    PlaceCard,
    StatsCard,
    Categories,
    FeaturedTours
  ],

  templateUrl: './home.html',

  styleUrl: './home.css'
})

export class Home {

}