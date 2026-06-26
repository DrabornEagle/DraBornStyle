export type dkd_ChecklistStatus = 'dkd_done' | 'dkd_active' | 'dkd_waiting';

export type dkd_ChecklistItem = {
  dkd_code: string;
  dkd_title: string;
  dkd_status: dkd_ChecklistStatus;
  dkd_note: string;
};

export const dkd_v0_1_checklist_items: dkd_ChecklistItem[] = [
  {
    dkd_code: 'dkd_001',
    dkd_title: 'Supabase core schema',
    dkd_status: 'dkd_done',
    dkd_note: 'Roller, işletme, usta, hizmet ve randevu tabloları hazır.'
  },
  {
    dkd_code: 'dkd_002',
    dkd_title: 'RLS güvenlik politikaları',
    dkd_status: 'dkd_done',
    dkd_note: 'Müşteri, işletme sahibi, usta ve admin için temel erişim kuralları eklendi.'
  },
  {
    dkd_code: 'dkd_003',
    dkd_title: 'Mobil uygulama başlangıcı',
    dkd_status: 'dkd_active',
    dkd_note: 'Expo başlangıç ekranı ve Termux zip kurulum akışı hazırlandı.'
  },
  {
    dkd_code: 'dkd_004',
    dkd_title: 'Rol seçimi ekranı',
    dkd_status: 'dkd_waiting',
    dkd_note: 'Sonraki adımda müşteri, işletme, usta ve admin yönlendirmesi yapılacak.'
  },
  {
    dkd_code: 'dkd_005',
    dkd_title: 'İşletme profil ekranı',
    dkd_status: 'dkd_waiting',
    dkd_note: 'İşletme adı, adres, telefon, şehir ve durum kayıtları bağlanacak.'
  },
  {
    dkd_code: 'dkd_006',
    dkd_title: 'Hizmet fiyat/süre ekranı',
    dkd_status: 'dkd_waiting',
    dkd_note: 'Hizmet adı, fiyat ve süre yönetimi Supabase ile senkronlanacak.'
  }
];
