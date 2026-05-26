import { Routes } from '@angular/router';
import { Home } from './features/home/pages/home/home';
import { Places } from './features/places/pages/places/places';
import { PlaceDetail } from './features/places/pages/place-detail/place-detail';
import { Tours } from './features/tours/pages/tours/tours';
import { TourDetail } from './features/tours/pages/tour-detail/tour-detail';
import { LoginPage } from './features/auth/pages/login/login';
import { RegisterPage } from './features/auth/pages/register/register';
import { ProfilePage } from './features/auth/pages/profile/profile';
import { BookingsPage } from './features/bookings/pages/bookings/bookings';

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
    path: 'lugares/:slug',
    component: PlaceDetail
  },
  {
    path: 'tours',
    component: Tours
  },
  {
    path: 'tours/:slug',
    component: TourDetail
  },
  {
    path: 'login',
    component: LoginPage
  },
  {
    path: 'registro',
    component: RegisterPage
  },
  {
    path: 'perfil',
    component: ProfilePage
  }
  ,
  {
    path: 'reservas',
    component: BookingsPage
  }
];
