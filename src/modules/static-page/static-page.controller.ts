import {
    Controller
} from '@nestjs/common';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';


@ApiBearerAuth()
@ApiHeader({
    name: 'Accept-Language',
    required: false,
    description: 'Language header: en, ar',
})
@ApiTags('Satic Page')
@Controller('static-page')
export class StaticPageController {
    constructor(
    ) { }
}
