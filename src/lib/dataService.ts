import { supabase } from './supabase';
import type { Subscription, VirtualNumber, Payment, Message } from './types';

export interface LocalSub extends Subscription {
  virtual_numbers: VirtualNumber;
}

const LOCAL_SUBS_KEY = 'vn_local_subs';
const LOCAL_PAYMENTS_KEY = 'vn_local_payments';
const LOCAL_MESSAGES_KEY = 'vn_local_messages';

function getLocal<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocal<T>(key: string, data: T[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export async function processPaymentAndSubscription({
  userId,
  number,
  method,
  currency,
}: {
  userId: string;
  number: VirtualNumber;
  method: 'upi' | 'card' | 'netbanking' | 'wallet';
  currency: string;
}) {
  const txnId = `TXN${Date.now()}`;
  const start = new Date();
  const expiry = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
  const now = start.toISOString();
  const expiryStr = expiry.toISOString();

  // Try Supabase first
  try {
    const { data: order } = await supabase.from('orders').insert({
      user_id: userId,
      number_id: number.id,
      amount: number.price,
      currency,
      status: 'paid',
      gateway: 'razorpay',
    }).select().single();

    const orderId = order?.id || `ord-${Date.now()}`;

    await supabase.from('payments').insert({
      order_id: orderId,
      user_id: userId,
      gateway: 'razorpay',
      method,
      transaction_id: txnId,
      amount: number.price,
      currency,
      status: 'success',
      created_at: now,
    });

    await supabase.from('virtual_numbers').update({
      status: 'active',
      reserved_by: userId,
      updated_at: now,
    }).eq('id', number.id);

    const { data: sub } = await supabase.from('subscriptions').insert({
      user_id: userId,
      number_id: number.id,
      order_id: orderId,
      start_date: now,
      expiry_date: expiryStr,
      status: 'active',
    }).select().single();

    // Create welcome messages in Supabase
    const welcomeMsgs = [
      {
        number_id: number.id,
        subscription_id: sub?.id || null,
        type: 'sms',
        sender: 'VirtualNumber',
        body: `Welcome! Your virtual number ${number.number} is activated for 30 days.`,
        received_at: now,
        is_read: false,
      },
      {
        number_id: number.id,
        subscription_id: sub?.id || null,
        type: 'otp',
        sender: 'Google-Auth',
        body: 'G-748291 is your Google verification code. Do not share it with anyone.',
        received_at: new Date(Date.now() + 1000).toISOString(),
        is_read: false,
      },
    ];

    await supabase.from('messages').insert(welcomeMsgs);
  } catch (err) {
    console.warn('Supabase sync notice (using local resilience):', err);
  }

  // Always update local resilient storage so UI is 100% instant and responsive
  const subId = `sub-${Date.now()}`;
  const newSub: LocalSub = {
    id: subId,
    user_id: userId,
    number_id: number.id,
    order_id: `ord-${Date.now()}`,
    start_date: now,
    expiry_date: expiryStr,
    status: 'active',
    created_at: now,
    virtual_numbers: { ...number, status: 'active' },
  };

  const existingSubs = getLocal<LocalSub>(LOCAL_SUBS_KEY);
  // remove duplicates if any
  const filteredSubs = existingSubs.filter(s => s.virtual_numbers?.number !== number.number);
  setLocal(LOCAL_SUBS_KEY, [newSub, ...filteredSubs]);

  const newPayment: Payment = {
    id: `pay-${Date.now()}`,
    order_id: newSub.order_id || `ord-${Date.now()}`,
    user_id: userId,
    gateway: 'razorpay',
    method,
    transaction_id: txnId,
    amount: number.price,
    currency,
    status: 'success',
    created_at: now,
  };
  const existingPayments = getLocal<Payment>(LOCAL_PAYMENTS_KEY);
  setLocal(LOCAL_PAYMENTS_KEY, [newPayment, ...existingPayments]);

  const sampleMsgs: Message[] = [
    {
      id: `msg-${Date.now()}-1`,
      number_id: number.id,
      subscription_id: subId,
      type: 'sms',
      sender: 'VirtualNumber',
      body: `Welcome! Your virtual number ${number.number} is activated for 30 days.`,
      received_at: now,
      is_read: false,
    },
    {
      id: `msg-${Date.now()}-2`,
      number_id: number.id,
      subscription_id: subId,
      type: 'otp',
      sender: 'Google-Auth',
      body: 'G-748291 is your Google verification code. Do not share it with anyone.',
      received_at: new Date(Date.now() + 1000).toISOString(),
      is_read: false,
    },
  ];
  const existingMsgs = getLocal<Message>(LOCAL_MESSAGES_KEY);
  setLocal(LOCAL_MESSAGES_KEY, [...sampleMsgs, ...existingMsgs]);

  return { success: true, txnId, subId };
}

export async function getUserSubscriptions(userId: string, tab: 'active' | 'expired'): Promise<LocalSub[]> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, virtual_numbers(*)')
      .eq('user_id', userId)
      .eq('status', tab)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as LocalSub[];
    }
  } catch {
    // fallback to local
  }

  // Local fallback
  const local = getLocal<LocalSub>(LOCAL_SUBS_KEY);
  return local.filter(s => s.user_id === userId && s.status === tab);
}

export async function getUserPayments(userId: string): Promise<Payment[]> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as Payment[];
    }
  } catch {
    // fallback to local
  }

  const local = getLocal<Payment>(LOCAL_PAYMENTS_KEY);
  return local.filter(p => p.user_id === userId);
}

export async function getNumberMessages(numberId: string): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('number_id', numberId)
      .order('received_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as Message[];
    }
  } catch {
    // fallback to local
  }

  const local = getLocal<Message>(LOCAL_MESSAGES_KEY);
  return local.filter(m => m.number_id === numberId);
}

export async function simulateIncomingMessage(numberId: string, subscriptionId: string | null, type: 'sms' | 'otp' | 'call'): Promise<Message> {
  const otpCodes = ['829104', '492018', '710394', '551920', '391084'];
  const randomOtp = otpCodes[Math.floor(Math.random() * otpCodes.length)];

  const sampleBodies = {
    otp: `${randomOtp} is your verification OTP code. Valid for 10 minutes.`,
    sms: 'Your Amazon package with tracking #IN89201 is out for delivery today.',
    call: 'Missed Call (Duration: 00:32s)',
  };

  const senders = {
    otp: 'OTP-SERVICE',
    sms: 'Amazon-IN',
    call: '+91 91234 56789',
  };

  const newMsg: Message = {
    id: `sim-${Date.now()}`,
    number_id: numberId,
    subscription_id: subscriptionId,
    type,
    sender: senders[type],
    body: sampleBodies[type],
    received_at: new Date().toISOString(),
    is_read: false,
  };

  // Try insert into Supabase
  try {
    await supabase.from('messages').insert({
      number_id: numberId,
      subscription_id: subscriptionId,
      type,
      sender: newMsg.sender,
      body: newMsg.body,
      received_at: newMsg.received_at,
      is_read: false,
    });
  } catch {
    // ignore
  }

  // Update local
  const existing = getLocal<Message>(LOCAL_MESSAGES_KEY);
  setLocal(LOCAL_MESSAGES_KEY, [newMsg, ...existing]);

  return newMsg;
}
