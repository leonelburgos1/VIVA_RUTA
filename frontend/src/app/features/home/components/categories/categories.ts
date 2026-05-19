import { Component } from '@angular/core';

import {
  Trees,
  Landmark,
  Mountain,
  Utensils,
  Waves,
  Church
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-categories',
  standalone: true,

  imports: [
  LucideAngularModule
],

  templateUrl: './categories.html',

  styleUrl: './categories.css'
})

export class Categories {

  readonly Trees = Trees;

  readonly Landmark = Landmark;

  readonly Mountain = Mountain;

  readonly Utensils = Utensils;

  readonly Waves = Waves;

  readonly Church = Church;

}