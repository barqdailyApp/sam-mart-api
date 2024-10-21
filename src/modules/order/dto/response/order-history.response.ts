import { OrderHistory } from 'src/infrastructure/entities/order/order-history.entity';

export class OrderHistoryResponse {
  id: string;
  order_id: string;
  delivery_fee: number;
  modified_by: any;
  created_at:Date;
  constructor(order_history: OrderHistory) {
    this.id = order_history.id;
    this.order_id = order_history.order_id;
    this.delivery_fee = order_history.delivery_fee;
    this.modified_by = {
      id: order_history.modified_by.id,
      name: order_history.modified_by.name,
    };
    this.created_at=order_history.created_at;
  }
}
