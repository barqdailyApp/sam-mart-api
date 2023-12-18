/**
 * @Enum string
 * @description status of uber order, order will be sent to the nearby drivers
 * @key CREATED: when client create a new order
 * @key LISTED: order will be listed in the app
 * @key ACCEPTED: driver accepted the order
 * @key STARTED: driver started the order
 * @key CANCELLED: order is cancelled
 * @key COMPLETED: order is completed
 * 
 */
export enum OrderStatus {
  CREATED = 'CREATED',
  BIKER_ON_THE_WAY = 'BIKER_ON_THE_WAY',
  BIKER_ARRIVED = 'BIKER_ARRIVED',
  STARTED = 'STARTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
