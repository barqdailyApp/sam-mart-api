import { Body, Controller, Get, HttpStatus, Inject, Put, Req, Res } from '@nestjs/common';
import { AboutUsService } from './about-us.service';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { AboutUs } from 'src/infrastructure/entities/about-us/about-us.entity';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { plainToClass, plainToInstance } from 'class-transformer';
import { AboutUsResponse } from './dto/aboutus.response';
import { UpdateAboutUsRequest } from './dto/update-aboutus.request';

@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@ApiTags('About-us')
@Controller('about-us')
export class AboutUsController {
  constructor(
    private readonly aboutUsService: AboutUsService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}


  @Get('download')
  redirectToPlatform(@Req() req, @Res() res) {
    const userAgent = req.headers['user-agent'];

    if (userAgent.includes('Android')) {
      return res.redirect(301, 'https://play.google.com/store/apps/details?id=com.quickyclean.quickycleanapp');
    } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      return res.redirect(301, 'https://apps.apple.com/us/app/quicky-clean/id6470739682?platform=iphone');
    } else {
      // If the user is not on Android or iOS, you can redirect them elsewhere or handle it as needed.
      return res.status(HttpStatus.NOT_FOUND).send('Not supported on this platform.');
    }}
  @Get()
  async getAboutUs() {
    const aboutUs_Data = await this.aboutUsService.getAboutUs();

    const entity_To_Dto = new AboutUsResponse({
      ...aboutUs_Data,
    });
    const aboutUs_Res = plainToInstance(AboutUsResponse, entity_To_Dto);
    const data: AboutUsResponse = this._i18nResponse.entity(aboutUs_Res);
    return new ActionResponse<AboutUsResponse>(data);
  }
  @Put()
  async UpdateAboutUs(@Body() updateAboutUsRequest: UpdateAboutUsRequest) {
    const aboutUs_Data = await this.aboutUsService.updateAboutUs(updateAboutUsRequest);

    const entity_To_Dto = new AboutUsResponse({
      ...aboutUs_Data,
    });
    const aboutUs_Res = plainToInstance(AboutUsResponse, entity_To_Dto);
    const data: AboutUsResponse = this._i18nResponse.entity(aboutUs_Res);
    return new ActionResponse<AboutUsResponse>(data);
  }
}
