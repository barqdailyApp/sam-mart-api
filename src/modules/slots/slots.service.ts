/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { Biker } from 'src/infrastructure/entities/biker/biker.entity';
import { Order } from 'src/infrastructure/entities/order/order.entity';
import { Slot } from 'src/infrastructure/entities/slot/slot.entity';
import { In, Not, Repository } from 'typeorm';
import { SlotResponse as SlotResponse } from './dto/respones/slot.response';
import { CreateSlotRequest } from './dto/requests/create-slot-request';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { UpdateSlotRequest } from './dto/requests/update-slot.request';
import { hourToDate } from 'src/core/helpers/cast.helper';
import { OrderStatus } from 'src/infrastructure/data/enums/order-status.enum';
import { th } from '@faker-js/faker';
@Injectable()
export class SlotsService extends BaseService<Slot> {
  constructor(
    @InjectRepository(Slot) private readonly slot_repo: Repository<Slot>,
    @InjectRepository(Order) private readonly order_repo: Repository<Order>,
    @Inject(REQUEST) private readonly request: Request,
    @InjectRepository(Biker) private readonly biker_repo: Repository<Biker>,
  ) {
    super(slot_repo);
  }
  async getAllAvailableDaySlot(date: string) {
    const slots = await this.slot_repo.find({ order: { start_time: 'ASC' } });
    const biker_ids = [];
    const available_slots = [];
    const all_bikers = await this.biker_repo.find({where:{is_active:true}});
    //* Get All slots In ascending
    await Promise.all(
      slots.map(async (e) => {
        //* Get All Orders For Specific date and slot time
        const orders = await this.order_repo.find({
          where: { order_date: date, slot_id: e.id,status :Not( OrderStatus.CANCELLED) },
        });
        //* it adds the time slot to the list of available slots.
        if (orders.length < all_bikers.length) {
          available_slots.push(e);
          return;
        }

        //* it retrieves the IDs of all the bikers who have already been assigned to orders for that slot.
        orders.forEach((e) => {
          biker_ids.push(e.biker_id);
        });

        //* It then checks if there are any bikers who are not in that list of IDs and adds the time slot to the list of available slots if such a biker exists.
        const biker_exist = await this.biker_repo.findOne({
          where: { id: Not(In(biker_ids)) },
        });

        if (biker_exist) {
          available_slots.push(e);
        }
      }),
    );

    const result = slots.map((e) => {
       
      const currentDate= hourToDate(e.start_time,date)
    
      return new SlotResponse({
        ...e,
        is_active: (available_slots.includes(e) && new Date()<currentDate )? true : false,
      });
    });

    return result;
  }

  async getDriverAvailableDaySlot(date: string) {
    console.log(this.request.user);
    const biker = await this.biker_repo.findOne({
      where: { user_id: this.request.user.id },
    });

    const orders = await this.order_repo.find({
      where: { order_date: date, biker_id: biker.id },
    });
    const busy_slots = orders.map((e) => e.slot_id);

    const available_slots = await this.slot_repo.find({
      where: { id: Not(In(busy_slots)) },order:{start_time:"ASC"}
    });

    const result = available_slots.map((e) => {
      const currentDate= hourToDate(e.start_time,date)
      console.log(currentDate)
      return new SlotResponse({
        ...e,
        is_active: (available_slots.includes(e) && new Date()<currentDate )? true : false,
      });
    });

    return result;
  }

  async updateDaySlot(updateSlotRequest: UpdateSlotRequest) {
    const { id } = updateSlotRequest;
    const slot = await this.slot_repo.findOneBy({
      id,
    });
    if (!slot) {
  throw new NotFoundException("message.slot_not_found");
    }
    return await this.slot_repo.update(id, updateSlotRequest);
  }
}
