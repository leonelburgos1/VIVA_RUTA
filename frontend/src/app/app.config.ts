import {

  ApplicationConfig,

  importProvidersFrom

} from '@angular/core';

import {

  provideRouter

} from '@angular/router';

import {

  provideHttpClient

} from '@angular/common/http';

import {

  routes

} from './app.routes';

import {

  LucideAngularModule,

  Search,
  MapPin,
  TrendingUp,
  Users,
  Award

} from 'lucide-angular';

export const appConfig: ApplicationConfig = {

  providers: [

    provideRouter(routes),

    provideHttpClient(),

    importProvidersFrom(

      LucideAngularModule.pick({

        Search,
        MapPin,
        TrendingUp,
        Users,
        Award

      })

    )

  ]

};