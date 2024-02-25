import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class OrdersTotalDashboardResponse {
  @Expose() ordersNew: number;
  @Expose() ordersDriversAccepted: number;
  @Expose() ordersProcessing: number;
  @Expose() ordersPicked: number;
  @Expose() ordersDelivered: number;
  @Expose() ordersCanceled: number;

  constructor(
    ordersNew: number,
    ordersDriversAccepted: number,
    ordersProcessing: number,
    ordersPicked: number,
    ordersDelivered: number,
    ordersCanceled: number,
  ) {
    this.ordersNew = ordersNew;
    this.ordersDriversAccepted = ordersDriversAccepted;
    this.ordersProcessing = ordersProcessing;
    this.ordersPicked = ordersPicked;
    this.ordersDelivered = ordersDelivered;
    this.ordersCanceled = ordersCanceled;
  }
}
