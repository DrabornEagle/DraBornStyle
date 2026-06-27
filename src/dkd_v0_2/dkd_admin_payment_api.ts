import { dkd_supabase_client } from '../dkd_config/dkd_supabase_client';

export type DkdAdminPaymentApproval = {
  id: string;
  business_id: string;
  amount: number;
  status: string;
  payment_method?: string | null;
  admin_note?: string | null;
  requested_at?: string | null;
};

export async function dkdLoadPaymentApprovals() {
  const result = await dkd_supabase_client
    .from('dkd_payment_approvals')
    .select('id, business_id, amount, status, payment_method, admin_note, requested_at')
    .order('requested_at', { ascending: false })
    .limit(50);

  if (result.error) throw result.error;
  return (result.data ?? []) as DkdAdminPaymentApproval[];
}

export async function dkdApprovePayment(approvalId: string, adminUserId: string, note?: string) {
  const result = await dkd_supabase_client
    .from('dkd_payment_approvals')
    .update({
      status: 'approved',
      approved_by: adminUserId,
      approved_at: new Date().toISOString(),
      admin_note: note ?? 'Admin onayladı'
    })
    .eq('id', approvalId);

  if (result.error) throw result.error;
}

export async function dkdRejectPayment(approvalId: string, note?: string) {
  const result = await dkd_supabase_client
    .from('dkd_payment_approvals')
    .update({
      status: 'rejected',
      rejected_at: new Date().toISOString(),
      admin_note: note ?? 'Admin reddetti'
    })
    .eq('id', approvalId);

  if (result.error) throw result.error;
}
