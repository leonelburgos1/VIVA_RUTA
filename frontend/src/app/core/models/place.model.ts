export interface Review {

  id: number;

  user_name: string;

  comment: string;

  rating: number;

  created_at: string;

}

export interface PlaceTourSummary {

  id: number;

  title: string;

  slug: string;

  price: number;

  duration: string;

  max_spots: number;

  rating: number;

  image_url: string;

  place_name: string;

  place_location: string;

}


export interface Place {

  id: number;

  title: string;

  slug: string;

  short_description: string;

  full_description: string;

  location: string;

  address: string;

  category: string;

  category_label: string;

  // 'image' es la ruta relativa que guarda Django (ej: "places/foto.jpg")
  // 'image_url' es la URL absoluta que construye el serializer (ej: "http://localhost:8000/media/places/foto.jpg")
  image: string;

  image_url: string;

  rating: number;

  features: string[];

  reviews: Review[];

  tours: PlaceTourSummary[];

  created_at: string;

  updated_at: string;

}
