import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from "typeorm";
import { Country } from "../country/country.entity";
import { City } from "../city/city.entity";
import { User } from "../user/user.entity";
import { EmployeeStatus } from "src/infrastructure/data/enums/employee-status.enum";

@Entity()
export class Employee extends AuditableEntity {
    @Column()
    name_ar: string;

    @Column()
    name_en: string;

    @Column()
    qualification: string;

    @Column({ type: 'enum', enum: EmployeeStatus, default: EmployeeStatus.INACTIVE })
    status: EmployeeStatus

    @OneToOne(() => User, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Country, (country) => country.employees, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'country_id' })
    country: Country;

    @Column()
    country_id: string;

    @ManyToOne(() => City, (city) => city.employees, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'city_id' })
    city: City;

}