import { Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Repository } from 'typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { ProfileResponse } from './dto/responses/profile.response';
import { FileService } from '../file/file.service';
import { UploadFileRequest } from '../file/dto/requests/upload-file.request';


@Injectable({ scope: Scope.REQUEST })
export class UserService extends BaseService<User> {
  constructor(

    @InjectRepository(User) private readonly userRepo: Repository<User>,


    @Inject(FileService) private _fileService: FileService,
    @Inject(REQUEST) readonly request: Request,

  ) {
    super(userRepo);
  }
}
