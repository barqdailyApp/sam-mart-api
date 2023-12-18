import { Body, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch, { Headers } from 'node-fetch';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Repository } from 'typeorm';
import { Language } from 'src/infrastructure/data/enums/language.enum';
@Injectable()
export class SmsService {
  constructor(
    @Inject(ConfigService) private readonly _config: ConfigService,
    @Inject(REQUEST) private readonly _request: Request,
    @InjectRepository(User) private readonly userRepo: Repository<User>,

  ) {}

  async sendSMS(phone: string, message: string) {
    try {
      const apiEndpoint = this._config.get<string>('sms.apiEndpoint');
      const key = this._config.get<string>('sms.key');
      const senderName = this._config.get<string>('sms.otpSenderId');

      const headers = new Headers([
        ['Content-Type', 'application/x-www-form-urlencoded'],
        ['Accept', 'application/json'],
      ]);
      console.log(key, apiEndpoint);
      console.log(phone);
      const params = new URLSearchParams();
      params.append('AppSid', key);
      params.append('SenderID', senderName);
      params.append('Recipient', phone.replace('+', ''));
      params.append('Body', message);
      console.log(params);
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers,

        body: params,
      });

      const data = await response.json();
      console.log(data.status);
      console.log('SMS', data);

      return data;
    } catch (error) {
      console.log(error);
    }
  }
  async sendSMSForGift(phone: string, message_ar: string, message_en: string) {
    try {
      const apiEndpoint = this._config.get<string>('sms.apiEndpoint');
      const key = this._config.get<string>('sms.key');
      const senderName = this._config.get<string>('sms.otpSenderId');

     
      const headers = new Headers([
        ['Content-Type', 'application/x-www-form-urlencoded'],
        ['Accept', 'application/json'],
      ]);
      console.log(key, apiEndpoint);
      console.log(phone);
      const params = new URLSearchParams();
      params.append('AppSid', key);
      params.append('SenderID', senderName);
      params.append('Recipient', phone.replace('+', ''));
    
        params.append('Body', message_ar);
      
      console.log(params);
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers,

        body: params,
      });

      const data = await response.json();
      console.log(data.status);
      console.log('SMS', data);

      return data;
    } catch (error) {
      console.log(error);
    }
  }
}
