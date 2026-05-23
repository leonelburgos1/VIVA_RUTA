import { Component, Input } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tour-card',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './tour-card.html',

  styleUrl: './tour-card.css'
})

export class TourCard {

  @Input() id!: number;
  @Input() slug!: string;
  @Input() title!: string;
  @Input() location!: string;
  @Input() description!: string;
  @Input() image!: string;
  @Input() price!: number;
  @Input() duration!: string;
  @Input() spots!: number;
  @Input() rating!: number;

  constructor(private router: Router) {}

  goToTour(): void {
    if (!this.slug?.trim()) {
      console.error('El tour no tiene slug y no se puede abrir el detalle.');
      return;
    }

    this.router.navigate(['/tours', this.slug]);
  }
}
