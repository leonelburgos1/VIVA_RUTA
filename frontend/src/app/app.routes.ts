import { Routes } from '@angular/router';

import { Home } from './features/home/pages/home/home';

import { Places } from './features/places/pages/places/places';

import { PlaceDetail } from './features/places/pages/place-detail/place-detail';

export const routes: Routes = [

  {
    path: '',

    component: Home
  },

  {
    path: 'lugares',

    component: Places
  },

  {
    path: 'lugares/:id',

    component: PlaceDetail
  }

];