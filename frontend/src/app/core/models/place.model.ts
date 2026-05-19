export interface Review {

  id: number;

  user_name: string;

  comment: string;

  rating: number;

  created_at: string;

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

  image: string;

  image_url: string;

  rating: number;

  features: string[];

  reviews: Review[];

  created_at: string;

  updated_at: string;

}