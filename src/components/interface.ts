export interface OrderDeliveryDate {
  invoice_no: string,
  deliveryDate: number,
  orderDate: number,
}

export type OrderStatus = 'cancel' | 'picked' | 'processing' | 'shipped' | 'delivered' | 'pending' | 'confirmed';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial' | 'refunded';

export interface OrderHistory {
  date: string,
  order_status: OrderStatus,
  payment_status: PaymentStatus,
  note: string,
}

export interface OrderDetail {
  invoice_no: string,
  order_status: OrderStatus,
  histories: OrderHistory[],
}

export interface OrderDetailApiResponse {
  success: boolean,
  data: OrderDetail,
}

export interface OrderStatusCount {
  status: string,
  count: number,
}

export interface Order {
  id: number,
  customer: any,
  invoice_no: string,
  order_status: OrderStatus,
  payment_method: string,
  payment_status: PaymentStatus,
  total: string,
  date: string,
}

export interface OrderApiResponse {
  count: number,
  next: string,
  previous: string,
  results: Order[],
}

export interface OrderSummaryStats {
  average: number,
  minimum: number,
  maximum: number,
}
