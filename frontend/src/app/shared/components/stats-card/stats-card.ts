import { Component, Input } from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stats-card',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './stats-card.html',

  styleUrl: './stats-card.css'
})

export class StatsCard {

  @Input() value!: string;

  @Input() label!: string;

}