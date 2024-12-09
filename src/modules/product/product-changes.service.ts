import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseUserService } from 'src/core/base/service/user-service.base';
import { ProductChanges } from 'src/infrastructure/entities/product/product-changes.entity';
import { Repository } from 'typeorm';
import {Request} from 'express';
export class ProductChangesService extends BaseUserService<ProductChanges> {
  constructor(
    @InjectRepository(ProductChanges)
    private readonly productChanges_repo: Repository<ProductChanges>,
    @Inject(REQUEST) private readonly  _request: Request
  ) {
    super(productChanges_repo,_request);
  }
}
