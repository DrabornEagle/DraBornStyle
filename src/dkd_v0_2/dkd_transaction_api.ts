import { dkd_supabase_client } from '../dkd_config/dkd_supabase_client';

export type DkdStartRecordInput = {
  businessId: string;
  serviceId: string;
  serviceTitle: string;
  basePrice: number;
  masterId?: string | null;
};

export type DkdFinishRecordInput = {
  recordId: string;
  basePrice: number;
  extraPrice: number;
  discountAmount: number;
  note?: string;
};

export async function dkdStartServiceRecord(input: DkdStartRecordInput) {
  const result = await dkd_supabase_client
    .from('dkd_service_transactions')
    .insert({
      business_id: input.businessId,
      master_id: input.masterId ?? null,
      service_id: input.serviceId,
      source: 'walk_in',
      status: 'started',
      service_title: input.serviceTitle,
      base_price: input.basePrice,
      final_price: input.basePrice,
      platform_fee_amount: 20,
      started_at: new Date().toISOString()
    })
    .select('id')
    .single();

  if (result.error) throw result.error;
  return result.data.id as string;
}

export async function dkdFinishServiceRecord(input: DkdFinishRecordInput) {
  const finalPrice = Math.max(0, input.basePrice + input.extraPrice - input.discountAmount);

  const result = await dkd_supabase_client
    .from('dkd_service_transactions')
    .update({
      status: 'completed',
      extra_price: input.extraPrice,
      discount_amount: input.discountAmount,
      final_price: finalPrice,
      final_price_note: input.note ?? '',
      completed_at: new Date().toISOString()
    })
    .eq('id', input.recordId);

  if (result.error) throw result.error;
  return finalPrice;
}

export async function dkdLoadServiceRecords(businessId: string) {
  const result = await dkd_supabase_client
    .from('dkd_service_transactions')
    .select('id, service_title, status, source, final_price, platform_fee_amount, created_at, completed_at')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(25);

  if (result.error) throw result.error;
  return result.data ?? [];
}

export async function dkdLoadBusinessPaymentSummary(businessId: string) {
  const result = await dkd_supabase_client
    .from('dkd_business_payment_report_summary')
    .select('*')
    .eq('business_id', businessId)
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data ?? null;
}
