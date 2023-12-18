import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { variableTypes } from 'src/infrastructure/data/enums/variable.enum';
import { Variable } from 'src/infrastructure/entities/variable/variable.entity';
import { Repository } from 'typeorm';

@Injectable()
export class VariableService extends BaseService<Variable> {
  constructor(
    @InjectRepository(Variable)
    private readonly variable_repo: Repository<Variable>,
  ) {
    super(variable_repo);
  }

  async getBookinglimit() {

  
    const booking_date = await this.variable_repo.findOneBy({
      type: variableTypes.BOOKING_DATE,
    });
    console.log(new Date().getTime());
    const date = new Date(
      new Date().getTime() +
        Number(booking_date.variable) * 24 * 60 * 60 * 1000,
    );
   
    return date ;
  }
}
