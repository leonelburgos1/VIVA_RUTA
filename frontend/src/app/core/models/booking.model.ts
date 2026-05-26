export interface Booking {
  id: number;
  user: number;
  user_email: string;
  tour: number;
  tour_title: string;
  tour_slug: string;
  tour_duration: string;
  tour_place_name: string;
  tour_image_url: string | null;
  date: string;
  guests: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}