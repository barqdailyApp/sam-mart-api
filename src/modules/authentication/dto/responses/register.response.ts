import { Exclude, Expose, Transform } from "class-transformer";
import { toUrl } from "src/core/helpers/file.helper";
import { Role } from "src/infrastructure/data/enums/role.enum";

export class RegisterResponse {
    @Expose() id: string;
    @Expose() account: string;
    @Expose() name: string;
    @Expose() @Transform(({ value }) => toUrl(value)) avatar: string;
    @Expose() username: string;
    @Expose() email: string;
    @Expose() email_verified_at: Date;
    @Expose() phone: string;
    @Expose() phone_verified_at: Date;
    @Expose() roles: Role[];
}
