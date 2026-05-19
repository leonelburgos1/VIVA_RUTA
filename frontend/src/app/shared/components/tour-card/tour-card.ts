import { Component, Input } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tour-card',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './tour-card.html',

  styleUrl: './tour-card.css'
})

export class TourCard {

  @Input() id!: number;
  @Input() title!: string;
  @Input() location!: string;
  @Input() image!: string;
  @Input() price!: number;
  @Input() duration!: string;
  @Input() spots!: number;
  @Input() rating!: number;
}