
import {Component,Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import { Router } from '@angular/router';

@Component({

  selector: 'app-place-card',

  standalone: true,

  imports: [
    CommonModule,
    RouterModule
  ],

  templateUrl: './place-card.html',

  styleUrl: './place-card.css'
})

export class PlaceCard {

  @Input() id!: number;
  @Input() title!: string;
  @Input() location!: string;
  @Input() image!: string;
  @Input() description!: string;
  @Input() category!: string;
  @Input() rating?: number;

  constructor(
  private router: Router
) {}

goToPlace() {

  this.router.navigate([
    '/lugares',
    this.id
  ]);

}

}