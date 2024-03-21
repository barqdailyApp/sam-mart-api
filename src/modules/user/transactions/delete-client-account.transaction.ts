import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { BaseTransaction } from 'src/core/base/database/base.transaction';

import { UserService } from 'src/modules/user/user.service';
import { DataSource, EntityManager, UpdateResult } from 'typeorm';

import { User } from 'src/infrastructure/entities/user/user.entity';

import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
@Injectable()
export class DeleteClientAccountTransaction extends BaseTransaction<
  { user_id: string },
  User
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    req: { user_id: string },
    context: EntityManager,
  ): Promise<User> {
    try {
      const timesTampDeleted = new Date().getTime();
      const user = await context.findOne(User, { where: { id: req.user_id } });
      if (!user) throw new NotFoundException('user not found');
      await context.update(
        User,
        { id: req.user_id },
        {
          username: `${user.name}_${timesTampDeleted}`,
          phone: `${user.phone}_${timesTampDeleted}`,
        },
      );

      await context.softDelete(User, { id: req.user_id });

      return await context.findOne(User, { where: { id: req.user_id } });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error);
    }
  }
}
