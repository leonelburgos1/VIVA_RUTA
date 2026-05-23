import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-place-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './place-card.html',
  styleUrl: './place-card.css'
})
export class PlaceCard {

  @Input() id!: number;
  @Input() slug!: string;
  @Input() title!: string;
  @Input() location!: string;
  @Input() image!: string;
  @Input() description!: string;
  @Input() category!: string;
  @Input() categoryLabel = '';
  @Input() features: string[] = [];
  @Input() rating?: number;

  constructor(private router: Router) {}

  goToPlace() {
    if (!this.slug?.trim()) {
      console.error('El lugar no tiene slug y no se puede abrir el detalle.');
      return;
    }

    this.router.navigate(['/lugares', this.slug]);
  }

  get categoryBadge(): string {
    const labels: Record<string, string> = {
      Nature: '🌿 Naturaleza',
      Religious: '⛪ Religioso',
      Adventure: '🥾 Aventura',
      Culture: '🎭 Cultura',
      Beach: '🌊 Playa'
    };

    return this.categoryLabel || labels[this.category] || this.category;
  }

}
