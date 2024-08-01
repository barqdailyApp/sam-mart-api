import { Injectable } from '@nestjs/common';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { SamModules } from 'src/infrastructure/entities/sam-modules/sam-modules.entity';
import { SamModulesEndpoints } from 'src/infrastructure/entities/sam-modules/sam-modules-endpoints.entity';

@Injectable()
export class SamModulesSeeder implements Seeder {
    constructor(
        @InjectRepository(SamModules)
        private readonly samModulesRepository: Repository<SamModules>,
        @InjectRepository(SamModulesEndpoints)
        private readonly samModulesEndpointsRepository: Repository<SamModulesEndpoints>
    ) { }

    async seed(): Promise<any> {
        const data = fs.readFileSync('./json/sam-modules-endpoints.json', 'utf8');
        const endpoints: any = JSON.parse(data);

        for (const item of endpoints) {
            for (const module of item.modules) {
                const existSamModule = await this.samModulesRepository.findOne({ where: { name_en: module } });
                if (existSamModule) {
                    const samModuleEndpoint = await this.samModulesEndpointsRepository.create({
                        sam_module_id: existSamModule.id,
                        samModule: existSamModule,
                        endpoint: item.path,
                        method: item.method,
                    });
                    await this.samModulesEndpointsRepository.save(samModuleEndpoint);
                } else {
                    const samModule = await this.samModulesRepository.create({
                        name_en: module,
                        name_ar: module,
                    });
                    await this.samModulesRepository.save(samModule);

                    const samModuleEndpoint = await this.samModulesEndpointsRepository.create({
                        sam_module_id: samModule.id,
                        samModule: samModule,
                        endpoint: item.path,
                        method: item.method,
                    });
                    await this.samModulesEndpointsRepository.save(samModuleEndpoint);
                }
            }
        }
    }

    async drop(): Promise<any> {
        await this.samModulesRepository.delete({});
        await this.samModulesEndpointsRepository.delete({});
        return;
    }
}