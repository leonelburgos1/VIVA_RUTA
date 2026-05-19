import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Place } from '../../../core/models/place.model';


@Injectable({
  providedIn: 'root'
})

export class PlaceService {

  private http = inject(HttpClient);

  private apiUrl = 'http://127.0.0.1:8000/api/places/';


  getPlaces(): Observable<Place[]> {

    return this.http.get<Place[]>(this.apiUrl);

  }


  createPlace(data: FormData): Observable<Place> {

    return this.http.post<Place>(this.apiUrl, data);

  }

}