export type RootTab = 'home' | 'explore' | 'appointments' | 'rewards' | 'profile';

export type Service = {
  id: string;
  title: string;
  description: string;
  duration: number;
  price: number;
  icon: string;
  accent: string;
};

export type Barber = {
  id: string;
  name: string;
  studio: string;
  neighborhood: string;
  distanceKm: number;
  rating: number;
  reviewCount: number;
  image: string;
  cover: string;
  tags: string[];
  nextSlot: string;
  queue: number;
  verified: boolean;
  featured: boolean;
  serviceIds: string[];
};

export type AppointmentStatus = 'confirmed' | 'completed' | 'cancelled';

export type Appointment = {
  id: string;
  barberId: string;
  serviceId: string;
  dateLabel: string;
  time: string;
  status: AppointmentStatus;
  createdAt: string;
};

export type BookingDraft = {
  barberId: string;
  serviceId: string;
  dateLabel: string;
  time: string;
};

export type DemoState = {
  onboardingCompleted: boolean;
  favoriteBarberIds: string[];
  appointments: Appointment[];
  rewardPoints: number;
  notificationsEnabled: boolean;
  selectedCity: string;
};
