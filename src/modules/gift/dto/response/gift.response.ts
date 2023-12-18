import { SubscriptionResponse } from 'src/modules/subscription/dto/subscroption.response';
import { UserInfoResponse } from 'src/modules/user/dto/responses/profile.response';

export class GiftResponse {
  sender: UserInfoResponse;
  receiver: UserInfoResponse;
  subscription: SubscriptionResponse;

  message: string;
  constructor(data: Partial<GiftResponse>) {
    Object.assign(this, data);
    
  }
}
