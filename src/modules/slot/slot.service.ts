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
  async findAllDay(delivery_day: string): Promise<Slot[]> {
    const now = new Date();
    now.setHours(now.getHours() + 3); // KSA offset if needed

    const currentTime = now.toTimeString().split(' ')[0]; // "HH:MM:SS"
    const dayOfWeek = new Date(delivery_day).toLocaleString('en-US', {
      weekday: 'long',
    });

    const slots = await this.slotRepository.find({
      where: { day_of_week: dayOfWeek, is_active: true },
      relations: { orders: true },
      order: {
        order_by: 'ASC',
        start_time: 'ASC',
      },
    });

    const availableSlots: Slot[] = [];

    for (const slot of slots) {
      const ordersForThisDay = slot.orders.filter(
        (order) => order.delivery_day === delivery_day,
      );

      const [hour, minute] = slot.start_time.split(':').map(Number);

      const slotStart = new Date(delivery_day);
      slotStart.setHours(hour, minute, 0, 0); // Slot datetime on delivery_day

      // If delivery day is today, exclude past time slots
      if (
        new Date(delivery_day).toDateString() === now.toDateString() &&
        slotStart <= now
      ) {
        continue; // skip past time slots for today
      }

      // Allow if not full and in the future
      if (ordersForThisDay.length < 10 && slotStart > now) {
        availableSlots.push(slot);
      }
    }

    return availableSlots;
  }

  async findAll() {
    return await this.slotRepository.find({
      order: { order_by: 'ASC', start_time: 'ASC' },
    });
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
    return await this.slotRepository.softDelete({ id: slot_id });
  }
}
