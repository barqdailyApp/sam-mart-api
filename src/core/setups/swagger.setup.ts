import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AuthenticationModule } from 'src/modules/authentication/authentication.module';
import { CityModule } from 'src/modules/city/city.module';
import { CountryModule } from 'src/modules/country/country.module';
import { UserModule } from 'src/modules/user/user.module';


export default (app: INestApplication, config: ConfigService) => {
  const operationIdFactory = (controllerKey: string, methodKey: string) =>
    methodKey;

  const publicConfig = new DocumentBuilder()
    .addBearerAuth()
    .setTitle(`${config.get('APP_NAME')} API`)
    .setDescription(`${config.get('APP_NAME')} API description`)
    .setVersion('v1')
    .setContact(
      'Contact',
      'https://github.com/mahkassem',
      'mahmoud.ali.kassem@gmail.com',
    )
    .setLicense('Developed by Mahmoud Kassem', 'https://github.com/mahkassem')
    .addServer(config.get('APP_HOST'))
    .build();

  const publicDocument = SwaggerModule.createDocument(app, publicConfig, {
    include: [
      UserModule,
      AuthenticationModule,
      CountryModule,
      CityModule
    ],
    operationIdFactory,
  });

  SwaggerModule.setup('swagger', app, publicDocument);
};
