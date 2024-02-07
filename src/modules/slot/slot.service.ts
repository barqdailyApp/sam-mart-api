import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Slot } from 'src/infrastructure/entities/order/slot.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateSlotRequest } from './dto/requests/create-slot.request';
import { UpdateSlotRequest } from './dto/requests/update-slot.request';

@Injectable()
export class SlotService {
  constructor(
    @InjectRepository(Slot)
    private readonly slotRepository: Repository<Slot>,
  ) {}

  async create(createSlotRequest: CreateSlotRequest): Promise<Slot> {
    const newSlot = this.slotRepository.create(createSlotRequest);
    return await this.slotRepository.save(newSlot);
  }
  async single(slot_id: string): Promise<Slot> {
    const slot = await this.slotRepository.findOne({
      where: { id: slot_id },
    });
    if (!slot) {
      throw new NotFoundException('message.slot_not_found');
    }
    return slot;
  }
  async findAll(delivery_day: string): Promise<Slot[]> {
    const slots = await this.slotRepository.find({
      relations: { orders: true },
      order: {
        order_by: 'ASC',
      },
    });
    const availableSlots = [];
    for (let i = 0; i < slots.length; i++) {
      const ordersDay = slots[i].orders.filter(
        (order) => order.delivery_day === delivery_day,
      );
      if (ordersDay.length < 10) {
        availableSlots.push(slots[i]);
      }
    }

    return availableSlots;
  }
  // async findAll(delivery_day: string): Promise<Slot[]> {
  //   return await this.slotRepository
  //     .createQueryBuilder('slot')
  //     .leftJoinAndSelect('slot.orders', 'order')
  //     .where(qb => {
  //       const subQuery = qb.subQuery()
  //         .select('order.slotId')
  //         .from(Order, 'order')
  //         .where('order.delivery_day = :delivery_day', { delivery_day })
  //         .groupBy('order.slotId')
  //         .having('COUNT(order.id) < 10')
  //         .getQuery();
  //       return 'slot.id IN ' + subQuery;
  //     })
  //     .orderBy('slot.order_by', 'ASC')
  //     .getMany();
  // }
  async update(
    slot_id: string,
    updateSlotRequest: UpdateSlotRequest,
  ): Promise<UpdateResult> {
    await this.single(slot_id);
    return await this.slotRepository.update({ id: slot_id }, updateSlotRequest);
  }
  async delete(slot_id: string): Promise<DeleteResult> {
    await this.single(slot_id);
    return await this.slotRepository.delete({ id: slot_id });
  }
}
