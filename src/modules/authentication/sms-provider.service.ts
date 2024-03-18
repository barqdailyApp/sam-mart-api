import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsProviderService {
  constructor(private readonly configService: ConfigService) {}
  async sendSms(mobileNo: string, text: string) {
    try {
      const orgName = await this.configService.get('ORG_NAME');
      const userName = await this.configService.get('USER_NAME');
      const password = await this.configService.get('PASSWORD');
      const coding = await this.configService.get('CODING');
      console.log(orgName, userName, password, mobileNo, text, coding);
      const response = await axios.post(
        'https://sms.alawaeltec.com/MainServlet',null,
        {
          params: {
            orgName: orgName,
            userName: userName,
            password: password,
            mobileNo: mobileNo,
            text: text,
            coding: coding,
          },
        },
      );
   
      console.log(response.data);
    
      return response.status === 200;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }
}
