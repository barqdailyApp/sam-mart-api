import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CountryResponse {
  @Expose() readonly id: string;
  @Expose() readonly name: string; 
  @Expose() readonly name_ar: string;
  @Expose() readonly name_en: string;

}
