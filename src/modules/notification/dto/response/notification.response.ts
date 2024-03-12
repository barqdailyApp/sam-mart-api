//notification response dto

import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsString } from 'class-validator';
import { NotificationEntity } from 'src/infrastructure/entities/notification/notification.entity';
@Exclude()
export class NotificationResponse {
    @Expose() id: string;

    @Expose() title_ar: string;
    @Expose() title_en: string;

    @Expose() text_ar: string;
    @Expose() text_en: string;

    @Expose() url: string;
    
    @Expose() type: string;
    
    @Expose() is_read: boolean;

    @Expose() seen_at: Date;
    
    @Expose() created_at: Date;

    constructor(notification:NotificationEntity){
        this.id = notification.id;
         this.title_ar = notification.title_ar;
         this.title_en = notification.title_en;
         this.text_ar = notification.text_ar;
         this.text_en = notification.text_ar;
        this.url = notification.url;
        this.type = notification.type;
        this.is_read = notification.is_read;
        this.seen_at = notification.seen_at;
        this.created_at = notification.created_at;


    }

}