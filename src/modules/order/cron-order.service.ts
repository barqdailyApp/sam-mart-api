import { Inject, Injectable } from "@nestjs/common";
import { OrderService } from "./order.service";
import { Cron } from '@nestjs/schedule';
import { OrderBookingTransaction } from "./util/order-booking.transaction";
import { EntityManager, In, Not } from "typeorm";
import { Biker } from "src/infrastructure/entities/biker/biker.entity";
import { Order } from "src/infrastructure/entities/order/order.entity";
import { OrderStatus } from "src/infrastructure/data/enums/order-status.enum";
import { Slot } from "src/infrastructure/entities/slot/slot.entity";
import { SlotObject, findNearestPoints } from "src/core/helpers/geom.helper";
import { Location } from "src/core/helpers/geom.helper";
import { Gateways } from "src/core/base/gateways";
import { OrderGateway } from "src/integration/gateways/order.gateway";
import { I18nResponse } from "src/core/helpers/i18n.helper";
import { OrderResponse } from "./dto/response/order-response";
@Injectable()
export class CronOrderService {
constructor(  private readonly context:EntityManager,

  @Inject(OrderGateway) private orderGateway: OrderGateway
    ){}

@Cron('5 0 * * *')
  async handleCron() {
    
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const date = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${date}`;
    let available_bikers = await this.context.find(Biker,{where:{is_active:true}});
      available_bikers= available_bikers.filter((e)=>{
        if(new Date()> e.in_active_start_date  && new Date()< e.in_active_end_date  )
        return
      return e
      })

    const cluster: Location[][] = [
        ...available_bikers.map((e) => [
          new Location({
            latitude: e.latitude,
            longitude: e.longitude,
          }),
        ]),
      ];

      const fixed_orders = await  this.context.find(Order, {
        where: {
          order_date: formattedDate,
          status: Not(
            OrderStatus.CREATED ||
              OrderStatus.CANCELLED ||
              OrderStatus.COMPLETED,
          ),
        },
      });
      const slots = await this.context.find(Slot, {
        order: { start_time: 'ASC' },
        relations: { orders: { address: true } },

        where: {
          orders: { order_date: formattedDate, status: OrderStatus.CREATED },
        },
      });

      for (let index = 0; index < slots.length; index++) {
        const points = findNearestPoints(
          slots[index].orders.map(
            (e) =>
              new Location({
                id: e.id,
                latitude: e.address.latitude,
                longitude: e.address.longitude,
              }),
          ),

          cluster.map((e) => {
            const busy_biker: SlotObject= {
              biker_id: available_bikers[cluster.indexOf(e)].id,
              slot_id: slots[index].id,
            };
            if (
              fixed_orders
                .map((e) => new SlotObject({biker_id:e.biker_id,slot_id:e.slot_id}))
                .includes(busy_biker)
            )
            return
              return cluster[cluster.indexOf(e)][
                cluster[cluster.indexOf(e)].length - 1
              ];
          }),
        );
        for (let index = 0; index < cluster.length; index++) {
          points.forEach((e) => {
            if (cluster[index].includes(e[1])) cluster[index].push(e[0]);
          });
        }

        for (let index = 0; index < cluster.length; index++) {
          const orders = await this.context.find(Order, {
            where: { id: In(cluster[index].map((e) => e.id)) },
          });
          orders.map((e) => (e.biker_id = available_bikers[index].id));


          await this.context.save(orders);
// const all_orders_biker=  await this.context.find(Order,{
//   where: {
//     order_date: formattedDate,
//   },
//   relations: {
//     services: true,
//     subscription: true,
//     slot: true,
//     vehicle: {
//       color: true,
//       images: true,
//       brand_model: true,
//       brand: true,
//     },
//     order_invoice: {
//       subscription: {
//         service: true,
//       },
//     },
//     address: true,
//     customer: { user: true },
//     biker: { user: true },
//   },
//   order: {
//     slot: {
//       start_time: 'ASC',
//     },
//   },
// });
//       const all_orders_biker_res = all_orders_biker.map(order=> new OrderResponse(order));
//           all_orders_biker.forEach((e)=>{

//             this.orderGateway.server.emit(
//               `${Gateways.Order.UserId}${e.biker.user_id}`,
//               {
//                 action: 'ORDER_BIKER_ON_THE_WAY',
//                 data: {
//                   order_id: e.id,
//                   message: all_orders_biker_res.filter((j)=>{if(j.biker.id==e.biker.id) return j}),
//                 },
//               },
//             );
          
//           })} 
//         }
//       }
   
  
}}}}