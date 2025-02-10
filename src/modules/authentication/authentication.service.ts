import { JwtService } from '@nestjs/jwt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginRequest } from './dto/requests/signin.dto';
import { Inject } from '@nestjs/common/decorators';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterRequest } from './dto/requests/register.dto';
import { SendOtpRequest } from './dto/requests/send-otp.dto';
import { VerifyOtpRequest } from './dto/requests/verify-otp.dto';
import { RegisterUserTransaction } from './transactions/register-user.transaction';
import { SendOtpTransaction } from './transactions/send-otp.transaction';
import { UserService } from '../user/user.service';
import { VerifyOtpTransaction } from './transactions/verify-otp.transaction';
import { jwtSignOptions } from 'src/core/setups/jwt.setup';
import { VerifyPhoneTransaction } from './transactions/edit-phone.transaction';
import { DeleteAccountTransaction } from './transactions/delete-account.transaction';
import { RegisterDriverTransaction } from './transactions/register-driver.transaction';
import { DriverRegisterRequest } from './dto/requests/driver-register.dto';
import { UpdateDriverStatusRequest } from './dto/requests/update-driver-status.request';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from 'src/infrastructure/entities/driver/driver.entity';
import { Like, Repository } from 'typeorm';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { SamModules } from 'src/infrastructure/entities/sam-modules/sam-modules.entity';
import { UsersSamModules } from 'src/infrastructure/entities/sam-modules/users-sam-modules.entity';
import { Otp } from 'src/infrastructure/entities/auth/otp.entity';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { RestaurantAdmin } from 'src/infrastructure/entities/restaurant/restaurant-admin.entity';

@Injectable()
export class AuthenticationService {
  constructor(
    @Inject(UserService) private readonly userService: UserService,
    @Inject(RegisterUserTransaction)
    private readonly registerUserTransaction: RegisterUserTransaction,
    @Inject(RegisterDriverTransaction)
    private readonly registerDriverTransaction: RegisterDriverTransaction,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,

    @InjectRepository(Otp) private readonly otpRepository: Repository<Otp>,
    @InjectRepository(SamModules)
    private readonly samModuleRepository: Repository<SamModules>,
    @InjectRepository(UsersSamModules)
    private readonly userSamModulesRepository: Repository<UsersSamModules>,
    @InjectRepository(RestaurantAdmin) private readonly restaurantAdmin : Repository<RestaurantAdmin>,
    @Inject(SendOtpTransaction)
    private readonly sendOtpTransaction: SendOtpTransaction,
    @Inject(VerifyOtpTransaction)
    private readonly verifyOtpTransaction: VerifyOtpTransaction,
    @Inject(VerifyPhoneTransaction)
    private readonly verifyPhoneTransaction: VerifyPhoneTransaction,
    @Inject(DeleteAccountTransaction)
    private readonly deleteAccountTransaction: DeleteAccountTransaction,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly _config: ConfigService,
  ) {}

  async validateUser(req: LoginRequest): Promise<any> {
    const user = await this.userService.findOne([
      { email: req.username },
      { username: req.username },
      { phone: req.username },
    ] as any);
    if(!user) return
    let isMatch = false;
    if (user) {
      isMatch = await bcrypt.compare(
        req.password + this._config.get('app.key'),
        user.password,
      );
    }
 
    if (user.roles.includes(Role.EMPLOYEE)) {
      const userSamModule = await this.userSamModulesRepository.find({
        where: { user_id: user.id },
        relations: ['samModule'],
      });
      const transformedSamModules = userSamModule
        .map((samModuleRelation) => {
          const { samModule } = samModuleRelation;
          return samModule
            ? ({
                id: samModule.id,
                name_en: samModule.name_en,
                name_ar: samModule.name_ar,
              } as unknown as UsersSamModules)
            : null;
        })
        .filter((samModule) => samModule !== null);
      // Assign the transformed data to a new property
      user.samModules = transformedSamModules;
    }
    if(user.roles.includes(Role.RESTAURANT_ADMIN)){
     
      const restaurantAdmin = await this.restaurantAdmin.findOne({
        where: { user_id: user.id },
        relations:{restaurant:true},
      });
      user.restaurant = restaurantAdmin.restaurant;
    }
    if (user && isMatch) {
      return user;
    }
    return null;
  }

  async login(user: any) {
    if (!user) throw new BadRequestException('message.invalid_credentials');
    const payload = { username: user.username, sub: user.id };
    return {
      ...user,
      access_token: this.jwtService.sign(payload, jwtSignOptions(this._config)),
    };
  }

  async register(req: RegisterRequest) {
    const user = await this.registerUserTransaction.run(req);

    return user;
  }

  async driverRegister(req: DriverRegisterRequest) {
    const user = await this.registerDriverTransaction.run(req);

    return user;
  }

  async updateDriverStatus(req: UpdateDriverStatusRequest) {
    const driver = await this.driverRepository.findOne({
      where: { id: req.driver_id },
    });

    if (!driver) throw new BadRequestException('driver not found');
      driver.type = req.type;
    driver.status = req.status;
    driver.status_reason = req.status_reason;

    await this.driverRepository.save(driver);
    return driver;
  }

  async sendOtp(req: SendOtpRequest) {
    return await this.sendOtpTransaction.run(req);
  }

  async getOtps(query: PaginatedRequest) {
   
   const page = (query.page??1) -1
   const limit = query.limit??20
    const otps = await this.otpRepository.findAndCount({
      where:{username: Like(`%${query.filters??''}%`)},
      order:{created_at:'DESC'},
      take: limit,
      skip: page *limit,
    });
    return otps;
  }

  async verifyOtp(req: VerifyOtpRequest) {
    return await this.verifyOtpTransaction.run(req);
  }

  async verifyPhone(req: VerifyOtpRequest) {
    return await this.verifyPhoneTransaction.run(req);
  }

  async deleteAccount(req: VerifyOtpRequest) {
    return await this.deleteAccountTransaction.run(req);
  }
}
