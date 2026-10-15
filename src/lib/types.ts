// All shared TypeScript interfaces for Virtual Number app

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface VirtualNumber {
  id: string;
  number: string;
  country: 'IN' | 'US';
  provider_ref: string | null;
  status: 'available' | 'reserved' | 'active' | 'expired';
  price: number;
  currency: string;
  reserved_by: string | null;
  reserved_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  number_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  gateway: string;
  gateway_order_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  user_id: string;
  gateway: string;
  method: 'upi' | 'card' | 'netbanking' | 'wallet' | null;
  transaction_id: string | null;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  number_id: string;
  order_id: string | null;
  start_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'cancelled';
  created_at: string;
  virtual_numbers?: VirtualNumber;
}

export interface Message {
  id: string;
  number_id: string;
  subscription_id: string | null;
  type: 'sms' | 'otp' | 'call';
  sender: string | null;
  body: string | null;
  received_at: string;
  is_read: boolean;
}
