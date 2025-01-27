import { Expose, plainToInstance, Transform } from 'class-transformer';
import { RestaurantResponse } from './restaurant.response';
import { toUrl } from 'src/core/helpers/file.helper';
import { UserResponse } from 'src/modules/user/dto/responses/user.response';
import { RestaurantAttachmentEnum } from 'src/infrastructure/data/enums/restaurant-attachment.enum';

export class AdminRestaurantDeatailsResponse extends RestaurantResponse {
  @Expose()
  @Transform((value) => {
    {
      const attachments = value.obj.attachments.map((item) => {
        console.log(item);
        item.url = toUrl(item.url);
        return item;
      });
    
      return {
        menu: attachments?.filter(
          (item) => item.type === RestaurantAttachmentEnum.MENU,
        ),
        license: attachments.filter(
          (item) => item.type === RestaurantAttachmentEnum.LICENSE,
        ),
      };
    }
  })
  attachments: any;
  @Expose()
  @Transform((value) => {
    return value.obj.cuisine_types?.map((item) => {
      item.image = toUrl(item.image);
      return item;
    });
  })
  cuisine_types: any;

  @Expose()
  @Transform((value) => {
    return value.obj.admins?.map((item) =>
      plainToInstance(UserResponse, item?.user, {
        excludeExtraneousValues: true,
      }),
    );
  })
  admins: any;
}
