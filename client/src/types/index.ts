// =============================================================================
// TypeScript Interfaces for LocalLink
// Synchronized with Prisma schema models and API envelopes.
// =============================================================================

export type Role = 'CUSTOMER' | 'PROVIDER' | 'ADMIN';

export type BookingStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'EXPIRED';

export type PriceType = 'FIXED' | 'HOURLY' | 'STARTING_AT';

export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';

export type CancelledBy = 'CUSTOMER' | 'PROVIDER' | 'SYSTEM';

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';

// --- User Models ---
export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  bio?: string | null;
  experienceYears?: number | null;
  city: string;
  area?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  serviceRadiusKm: number;
  isVerified: boolean;
  avgRating: number;
  totalReviews: number;
  totalBookings: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
  services?: Service[];
  gallery?: ProviderGallery[];
  availability?: Availability[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  providerId: string;
  categoryId: string;
  name: string;
  description?: string | null;
  price: number;
  priceType: PriceType;
  durationMinutes?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Partial<Category>;
  provider?: Partial<ProviderProfile>;
  images?: ServiceImage[];
}

export interface ServiceImage {
  id: string;
  serviceId: string;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
}

export interface ProviderGallery {
  id: string;
  providerId: string;
  imageUrl: string;
  caption?: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface Availability {
  id: string;
  providerId: string;
  dayOfWeek: DayOfWeek;
  startTime: string; // ISO / Time string
  endTime: string;
  isAvailable: boolean;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  status: BookingStatus;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
  quotedPrice: number;
  finalPrice?: number | null;
  cancellationReason?: string | null;
  cancelledBy?: CancelledBy | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: Partial<User>;
  provider?: Partial<ProviderProfile> & { user?: Partial<User> };
  service?: Partial<Service>;
  review?: Review | null;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment?: string | null;
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
  customer?: Partial<User>;
}

export interface Favorite {
  id: string;
  customerId: string;
  providerId: string;
  createdAt: string;
  provider?: ProviderProfile & { user?: User };
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  referenceId?: string | null;
  referenceType?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId?: string | null;
  reportedReviewId?: string | null;
  reason: string;
  status: ReportStatus;
  adminNotes?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  reporter?: User;
  reportedUser?: User | null;
  reportedReview?: Review | null;
}

// --- API Envelopes ---
export interface ApiResponseEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponseEnvelope<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: PaginatedMeta;
}
