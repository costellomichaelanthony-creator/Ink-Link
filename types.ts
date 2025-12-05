
export enum UserRole {
  ARTIST = 'ARTIST',
  CLIENT = 'CLIENT',
  STUDIO = 'STUDIO'
}

export interface Profile {
  id: string;
  role: UserRole;
  display_name: string;
  location?: string;
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  
  // Artist specific
  styles?: string[];
  years_experience?: number;
  instagram_handle?: string;
  website_url?: string;
}

export interface PortfolioItem {
  id: string;
  artist_id: string;
  title: string;
  description?: string;
  style_tags?: string[];
  image_url: string;
  created_at: string;
}

export interface MarketplaceDesign {
  id: string;
  artist_id: string;
  title: string;
  description?: string;
  style_tags?: string[];
  image_url: string;
  price_cents: number;
  is_available: boolean;
  created_at: string;
  artist?: Profile; // Joined data
}

export interface GeneratedDesign {
  imageUrl: string;
  prompt: string;
  style: string;
  createdAt: Date;
}

export enum TattooStyle {
  TRADITIONAL = 'American Traditional',
  REALISM = 'Realism',
  MINIMALIST = 'Minimalist',
  TRIBAL = 'Tribal',
  WATERCOLOR = 'Watercolor',
  NEO_TRADITIONAL = 'Neo Traditional',
  JAPANESE = 'Irezumi',
  BLACKWORK = 'Blackwork',
  GEOMETRIC = 'Geometric'
}

// Phase 5 Additions
export interface Studio {
  id: string;
  name: string;
  location: string;
  address?: string;
  website_url?: string;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  CANCELLED = 'CANCELLED',
  DEPOSIT_PAID = 'DEPOSIT_PAID', // Phase 6
  COMPLETED = 'COMPLETED'
}

export interface Booking {
  id: string;
  client_id: string;
  artist_id: string;
  studio_id?: string;
  status: BookingStatus;
  requested_date: string;
  requested_time_window: string;
  description: string;
  reference_image_urls?: string[];
  budget_cents_min?: number;
  budget_cents_max?: number;
  deposit_amount_cents?: number; // Phase 6
  created_at: string;
  
  // Joined Data
  artist?: Profile;
  client?: Profile;
  studio?: Studio;
}

export interface BookingMessage {
  id: string;
  booking_id: string;
  sender_id: string;
  message: string;
  created_at: string;
  sender?: Profile;
}

// Phase 7 Additions
export interface DesignConcept {
  id: string;
  user_id: string;
  prompt: string;
  style: string;
  placement: string;
  description_summary: string;
  image_url: string;
  created_at: string;
}

export interface DesignPreview {
  id: string;
  user_id: string;
  body_photo_url: string;
  overlay_image_url: string;
  settings: {
    scale: number;
    rotation: number;
    opacity: number;
    x: number;
    y: number;
  };
  created_at: string;
}

// Phase 8 Additions
export enum EventType {
  CONVENTION = 'CONVENTION',
  GUEST_SPOT = 'GUEST_SPOT'
}

export interface InkEvent {
  id: string;
  type: EventType;
  title: string;
  description?: string;
  location: string;
  venue?: string;
  start_date: string;
  end_date: string;
  organizer_id: string;
  image_url?: string;
  created_at: string;
  
  organizer?: Profile;
}

export interface EventAttendee {
  event_id: string;
  user_id: string;
  status: 'INTERESTED' | 'GOING';
  created_at: string;
}