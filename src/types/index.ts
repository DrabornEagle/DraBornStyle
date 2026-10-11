export type Row = Record<string, any>;
export type Role = "customer" | "staff" | "owner" | "admin";
export type Tone = "pink" | "cyan" | "gold" | "green" | "red" | "purple";
export type Route = { name: string; params?: Row };
export type Membership = {
  business_id: string;
  business_name: string;
  role: string;
  staff_id: string | null;
  can_edit_prices: boolean;
};
export type Bootstrap = {
  profile: Row | null;
  is_admin: boolean;
  memberships: Membership[];
  demo_batches: Row[];
  settings: Row;
};
export type Business = Row & {
  id: string;
  name: string;
  staff: Row[];
  services: Row[];
  staff_services?: Row[];
  hours?: Row[];
};
