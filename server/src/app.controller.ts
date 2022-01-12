import {Controller, Logger} from '@nestjs/common';
import {Ctx, MessagePattern, Payload, RmqContext} from '@nestjs/microservices';
import {Message} from './enums/message.enum';

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name);

    @MessagePattern(Message.INFO)
    getInfo(
        @Payload() data: string,
        @Ctx() context: RmqContext
    ) {
        this.logger.log(`[${context.getPattern()}] New message: ${data}`)
        return `Echo: ${data}`;
    }
}
