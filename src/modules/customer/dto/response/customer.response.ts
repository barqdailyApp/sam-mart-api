import { Exclude, Expose } from 'class-transformer';
import { ServiceResponse } from 'src/modules/service/dto/service.response';
import { UserInfoResponse } from 'src/modules/user/dto/responses/profile.response';

@Exclude()
export class CustomerResponse {
  @Expose() id: string;

  @Expose() user: UserInfoResponse;


  constructor(partial: Partial<CustomerResponse>) {
    this.id = partial.id;

    this.user = new UserInfoResponse(partial.user);
  }
}
