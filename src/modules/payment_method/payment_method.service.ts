import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { PaymentMethod } from 'src/infrastructure/entities/payment_method/payment_method.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentMethodService extends BaseService<PaymentMethod> {
    constructor(
        @InjectRepository(PaymentMethod)
        private readonly payment_repo: Repository<PaymentMethod>,
    ) {
        super(payment_repo);
    }
}
