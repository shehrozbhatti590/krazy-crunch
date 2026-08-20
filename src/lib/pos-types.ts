export type PaymentMethod = "cash" | "online";
export type OrderType = "dine-in" | "takeaway" | "delivery";
export type OrderStatus = "completed" | "cancelled";

export interface OrderLineItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export interface PosOrder {
  id: string;
  created_at: string;
  order_number: number;
  items: OrderLineItem[];
  subtotal: number;
  payment_method: PaymentMethod;
  order_type: OrderType;
  status: OrderStatus;
  notes: string | null;
  staff_name: string | null;
}
