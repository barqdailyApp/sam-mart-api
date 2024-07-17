import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { or } from 'sequelize';
import { BaseService } from 'src/core/base/service/service.base';

import { PaymentMethod } from 'src/infrastructure/entities/payment_method/payment_method.entity';
import { Repository } from 'typeorm';
import { KuraimiUserCheckRequest } from './dto/requests/kuraimi-user-check';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { decodeUUID } from 'src/core/helpers/cast.helper';
import { auth } from 'firebase-admin';
import * as https from 'https';
import { KuraimiPayRequest } from './dto/requests/kuraimi-pay.request';
import { EditPaymentMethodRequest } from './dto/requests/edit-payment-method.request';
import { FileService } from '../file/file.service';

@Injectable()
export class PaymentMethodService extends BaseService<PaymentMethod> {
  constructor(
    @Inject(FileService) private _fileService: FileService,
    @InjectRepository(PaymentMethod)
    private readonly payment_repo: Repository<PaymentMethod>,
    @InjectRepository(User) private readonly user_repo: Repository<User>,
  ) {
    super(payment_repo);
  }
  private tokens: Record<string, string> = {};
  private jaibToken: Record<string, string> = {};

  private username = process.env.wepay_username;
  private password = process.env.wepay_password;
  private grant_type = process.env.wepay_grant_type;
  private client_id = process.env.wepay_client_id;
  private client_secret = process.env.wepay_client_secret;
  private OrgID = process.env.wepay_OrgID;
  private scope = process.env.wepay_scope;
  private agent_wallet = process.env.wepay_agent_wallet;
  private agent_wallet_password = process.env.wepay_agent_wallet_password;
  private currency = process.env.wepay_currency;

  async jaibLogin() {
    const login_response = await axios.post(
      'https://app.wecash.com.ye:8493/paygate/oauth/token',
      {
        userName: "",
        password: "",
       agentCode:""
      },
    );
    
  }
  async jawaliLogin() {
    const {
      username,
      password,
      grant_type,
      client_id,
      client_secret,
      OrgID,
      scope,
      agent_wallet,
      agent_wallet_password,
    } = this;
    const login_response = await axios.post(
      'https://app.wecash.com.ye:8493/paygate/oauth/token',
      null,
      {
        params: {
          username: username,
          password: password,
          grant_type: grant_type,
          client_id: client_id,
          client_secret: client_secret,
          scope: scope,
        },
      },
    );

    if (login_response.data.access_token) {
      const access_token = login_response.data.access_token;
      this.tokens['access_token'] = access_token;
      console.log(access_token);

      const wallet_response = await axios.post(
        'https://app.wecash.com.ye:8493/paygate/v1/ws/callWS',

        {
          header: {
            serviceDetail: {
              corrID: '59ba381c-1f5f-4480-90cc-0660b9cc850e',
              domainName: 'WalletDomain',
              serviceName: 'PAYWA.WALLETAUTHENTICATION',
            },
            signonDetail: {
              clientID: 'WeCash',
              orgID: OrgID,
              userID: username,
              externalUser: 'user1',
            },
            messageContext: {
              clientDate: '202211101156',
              bodyType: 'Clear',
            },
          },
          body: {
            identifier: agent_wallet,
            password: agent_wallet_password,
          },
        },

        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );
      if (wallet_response.data.responseBody.access_token) {
        const wallet_token = wallet_response.data.responseBody.access_token;
        this.tokens['wallet_token'] = wallet_token;
        return {
          access_token: access_token,
          wallet_token: wallet_token,
        };
      }
    }
  }
  async jawalicashOut(
    voucher: string,
    wallet_number: string,
    order_price: number,
  ): Promise<boolean> {
    const {
      username,

      OrgID,

      agent_wallet,
      agent_wallet_password,
      currency,
    } = this;

    let access_token = this.tokens['access_token'];
    let wallet_token = this.tokens['wallet_token'];

    if (!access_token || !wallet_token) {
      const tokens = await this.jawaliLogin();
      access_token = tokens['access_token'];
      wallet_token = tokens['wallet_token'];
    }

    try {
      const enquire_response = await axios.post(
        'https://app.wecash.com.ye:8493/paygate/v1/ws/callWS',
        {
          header: {
            serviceDetail: {
              corrID: '59ba381c-1f5f-4480-90cc-0660b9cc850e',
              domainName: 'MerchantDomain',
              serviceName: 'PAYAG.ECOMMERCEINQUIRY',
            },
            signonDetail: {
              clientID: 'WeCash',
              orgID: OrgID,
              userID: username,
              externalUser: 'user1',
            },
            messageContext: {
              clientDate: '202211101156',
              bodyType: 'Clear',
            },
          },
          body: {
            agentWallet: agent_wallet,
            password: agent_wallet_password,
            txncurrency: currency,
            voucher: voucher,
            receiverMobile: wallet_number,
            accessToken: wallet_token,

            purpose: 'test bill payment',
          },
        },
        { headers: { Authorization: `Bearer ${access_token}` } },
      );

      if (
        enquire_response.data.responseStatus.systemStatusDesc === 'Success' &&
        Number(enquire_response.data.responseBody.txnamount) >= order_price
      ) {
        try {
          const response = await axios.post(
            'https://app.wecash.com.ye:8493/paygate/v1/ws/callWS',
            {
              header: {
                serviceDetail: {
                  corrID: '59ba381c-1f5f-4480-90cc-0660b9cc850e',
                  domainName: 'MerchantDomain',
                  serviceName: 'PAYAG.ECOMMCASHOUT',
                },
                signonDetail: {
                  clientID: 'WeCash',
                  orgID: OrgID,
                  userID: username,
                  externalUser: 'user1',
                },
                messageContext: {
                  clientDate: '202211101156',
                  bodyType: 'Clear',
                },
              },
              body: {
                agentWallet: agent_wallet,
                password: agent_wallet_password,
                txncurrency: currency,
                voucher: voucher,
                receiverMobile: wallet_number,
                accessToken: wallet_token,

                purpose: 'test bill payment',
              },
            },
            { headers: { Authorization: `Bearer ${access_token}` } },
          );

          return response.data.responseStatus.systemStatusDesc === 'Success'
            ? true
            : false;
        } catch (error) {
          console.log(error);
        }
      } else throw new BadRequestException('message.wrong_voucher_number');
    } catch (error) {
      if (error.response.status == 401) {
        const { wallet_token, access_token } = await this.jawaliLogin();
        this.tokens['wallet_token'] = wallet_token;
        this.tokens['access_token'] = access_token;
        await this.jawalicashOut(voucher, wallet_number, order_price);
      }
    }
  }

  async checkUser(req: KuraimiUserCheckRequest) {
    const allowed_zones = ['YE0012003', 'YE0012004', 'YE0012005'];

    const user = await this.user_repo.findOne({
      where: [
        {
          username: '+967' + req.MobileNo,
          // email: req.Email,
          // id: req.SCustID ? decodeUUID(req.SCustID) : null,
        },
        { email: req.Email },
        { id: req.SCustID ? decodeUUID(req.SCustID) : null },
      ],
    });

    if (!user || !allowed_zones.includes(req.CustomerZone)) return null;

    return user;
  }

  async kuraimiPay(req: KuraimiPayRequest) {
    const httpsAgent = new https.Agent({ rejectUnauthorized: false });

    const username = 'bArQ#UaT_';
    const password = 'b@Rq_12!34#5';

    try {
      const response = await axios.post(
        'https://web.krmbank.net.ye:44746/alk-payments-exp/v1/PHEPaymentAPI/EPayment/SendPayment',

        {
          SCustID: req.SCustID,
          REFNO: req.REFNO,
          AMOUNT: req.AMOUNT,
          CRCY: 'YER',
          MRCHNTNAME: 'Merchant 1',
          PINPASS: Buffer.from(req.PINPASS).toString('base64'),
        },
        {
          auth: { username: username, password },

          httpsAgent: httpsAgent, // Pass the custom agent to ignore SSL certificate validation
        },
      );
      return response.data;
    } catch (error) {
      console.log(error.response);
    }
  }

  async editPaymentMethod(req: EditPaymentMethodRequest) {
    const payment_method = await this.payment_repo.findOne({
      where: { id: req.id },
    });
    if (!payment_method) {
      throw new ForbiddenException('Payment Method Not Found');
    }
    const payment_methods_count = await this._repo.count();
    if (req.order_by) {
      if (req.order_by > payment_methods_count) {
        throw new ForbiddenException(
          'order_by must be less than or equal to ' + payment_methods_count,
        );
      }
      const prev_payment_method = await this.payment_repo.findOne({
        where: { order_by: req.order_by },
      });
      if (prev_payment_method) {
        prev_payment_method.order_by = payment_method.order_by;
        await this.payment_repo.save(prev_payment_method);
      }
      payment_method.order_by = req.order_by;
    }
    if (req.logo) {
      await this._fileService.delete(payment_method.logo);
      const logo = await this._fileService.upload(req.logo, 'payment_method');
      payment_method.logo = logo;
    }

    const edited_payment_method = await this.payment_repo.update(
      payment_method.id,
      { ...req, logo: payment_method.logo },
    );
    return edited_payment_method;
  }
}
