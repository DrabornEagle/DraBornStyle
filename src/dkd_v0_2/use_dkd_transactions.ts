import React from 'react';

import {
  dkdFinishServiceRecord,
  dkdLoadBusinessPaymentSummary,
  dkdLoadServiceRecords,
  dkdStartServiceRecord
} from './dkd_transaction_api';

type ServiceItem = {
  dkd_service_id: string;
  dkd_service_title: string;
  dkd_price_cents: number;
};

type Summary = {
  pending_fee_total?: number | null;
  completed_revenue_total?: number | null;
};

export function useDkdTransactions(businessId: string | null, services: ServiceItem[], onStatus: (message: string) => void) {
  const [records, setRecords] = React.useState<any[]>([]);
  const [summary, setSummary] = React.useState<Summary | null>(null);

  async function refreshTransactions() {
    if (!businessId) return;
    const nextRecords = await dkdLoadServiceRecords(businessId);
    const nextSummary = await dkdLoadBusinessPaymentSummary(businessId);
    setRecords(nextRecords as any[]);
    setSummary(nextSummary as Summary | null);
  }

  React.useEffect(() => {
    refreshTransactions().catch((error) => onStatus(error.message));
  }, [businessId]);

  async function startTransaction(serviceId: string, masterId?: string | null) {
    if (!businessId) {
      onStatus('Önce salon kaydı gerekli.');
      return;
    }

    const service = services.find((item) => item.dkd_service_id === serviceId);
    if (!service) {
      onStatus('Önce hizmet seç veya hizmet ekle.');
      return;
    }

    await dkdStartServiceRecord({
      businessId,
      serviceId: service.dkd_service_id,
      serviceTitle: service.dkd_service_title,
      basePrice: Math.round(service.dkd_price_cents / 100),
      masterId
    });

    onStatus('İşlem başlatıldı.');
    await refreshTransactions();
  }

  async function finishTransaction(recordId: string, extraPrice: number, discountAmount: number, note: string) {
    const record = records.find((item) => item.id === recordId);
    const finalPrice = await dkdFinishServiceRecord({
      recordId,
      basePrice: Number(record?.final_price ?? 0),
      extraPrice,
      discountAmount,
      note
    });

    onStatus(`İşlem bitti. Son fiyat: ${Math.round(finalPrice)} TL.`);
    await refreshTransactions();
  }

  return {
    records,
    summary,
    debtTotal: Number(summary?.pending_fee_total ?? 0),
    revenueTotal: Number(summary?.completed_revenue_total ?? 0),
    refreshTransactions,
    startTransaction,
    finishTransaction
  };
}
