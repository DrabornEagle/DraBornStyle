import { Appointment, Barber, Service } from '../types';

export const services: Service[] = [
  { id: 'haircut', title: 'Saç Kesimi', description: 'Yüz şekline özel modern kesim', duration: 40, price: 450, icon: 'cut-outline', accent: '#FF4D8D' },
  { id: 'beard', title: 'Sakal Tasarım', description: 'Hat belirleme ve sıcak havlu', duration: 25, price: 280, icon: 'sparkles-outline', accent: '#6C63FF' },
  { id: 'combo', title: 'Saç + Sakal', description: 'Eksiksiz premium bakım paketi', duration: 65, price: 650, icon: 'diamond-outline', accent: '#2DD4FF' },
  { id: 'care', title: 'Cilt Bakımı', description: 'Arındırma, maske ve nemlendirme', duration: 35, price: 380, icon: 'water-outline', accent: '#35E1A1' },
  { id: 'kids', title: 'Çocuk Kesimi', description: 'Rahat ve eğlenceli çocuk kesimi', duration: 30, price: 320, icon: 'happy-outline', accent: '#FFB648' },
  { id: 'style', title: 'Özel Stil', description: 'Etkinlik ve çekim için saç tasarımı', duration: 50, price: 560, icon: 'flash-outline', accent: '#FF5E6C' },
];

export const barbers: Barber[] = [
  {
    id: 'arda', name: 'Arda Yılmaz', studio: 'Blade District', neighborhood: 'Konyaaltı', distanceKm: 1.2,
    rating: 4.9, reviewCount: 324, image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=700&q=85',
    cover: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1200&q=85',
    tags: ['Fade Uzmanı', 'Premium'], nextSlot: '16:30', queue: 2, verified: true, featured: true,
    serviceIds: ['haircut', 'beard', 'combo', 'care', 'style'],
  },
  {
    id: 'mert', name: 'Mert Kaya', studio: 'North Cut Studio', neighborhood: 'Lara', distanceKm: 2.8,
    rating: 4.8, reviewCount: 211, image: 'https://images.unsplash.com/photo-1615813967515-e1838c1c5116?auto=format&fit=crop&w=700&q=85',
    cover: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=85',
    tags: ['Sakal Tasarım', 'VIP Oda'], nextSlot: '17:00', queue: 1, verified: true, featured: true,
    serviceIds: ['haircut', 'beard', 'combo', 'care'],
  },
  {
    id: 'emir', name: 'Emir Şahin', studio: 'Neon Barber Lab', neighborhood: 'Muratpaşa', distanceKm: 3.4,
    rating: 4.7, reviewCount: 146, image: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?auto=format&fit=crop&w=700&q=85',
    cover: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=1200&q=85',
    tags: ['Modern Stil', 'Gece Açık'], nextSlot: '18:15', queue: 3, verified: true, featured: false,
    serviceIds: ['haircut', 'combo', 'kids', 'style'],
  },
  {
    id: 'kaan', name: 'Kaan Demir', studio: 'Gentleman Garage', neighborhood: 'Kepez', distanceKm: 5.1,
    rating: 4.6, reviewCount: 98, image: 'https://images.unsplash.com/photo-1582893561942-d61adcb2e534?auto=format&fit=crop&w=700&q=85',
    cover: 'https://images.unsplash.com/photo-1512690459411-b9245aed614b?auto=format&fit=crop&w=1200&q=85',
    tags: ['Klasik Kesim', 'Aile Dostu'], nextSlot: '15:45', queue: 0, verified: false, featured: false,
    serviceIds: ['haircut', 'beard', 'combo', 'kids'],
  },
];

export const dateOptions = ['Bugün', 'Yarın', 'Salı', 'Çarşamba', 'Perşembe'];
export const timeOptions = ['10:00', '11:30', '13:00', '14:30', '16:00', '17:30', '19:00', '20:30'];

export const initialAppointments: Appointment[] = [
  {
    id: 'demo-upcoming', barberId: 'arda', serviceId: 'combo', dateLabel: 'Yarın', time: '16:30',
    status: 'confirmed', createdAt: '2026-08-02T12:00:00.000Z',
  },
  {
    id: 'demo-past', barberId: 'mert', serviceId: 'haircut', dateLabel: '26 Temmuz', time: '13:00',
    status: 'completed', createdAt: '2026-07-26T10:00:00.000Z',
  },
];
