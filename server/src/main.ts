import {NestFactory} from '@nestjs/core';
import {Logger} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {resolve} from 'path';
import {AppModule} from './app.module';
import {MicroserviceOptions, Transport} from '@nestjs/microservices';
import {Queue} from './enums/queue.enum';
import {getEnv} from './helpers/get-env.helper';
import {Environment} from './interfaces/environment.interface';
import {AmqplibQueueOptions} from "@nestjs/microservices/external/rmq-url.interface";

async function bootstrap() {
    const bootstrapLogger = new Logger('BOOTSTRAP');
    const configContext = await NestFactory.createApplicationContext(
        ConfigModule.forRoot({
            envFilePath: resolve('config', getEnv()),
            expandVariables: true,
        }),
        {
            logger: bootstrapLogger,
        }
    );

    const configService = configContext.get<ConfigService, ConfigService<Environment>>(ConfigService)

    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        {
            transport: Transport.RMQ,
            options: {
                urls: [configService.get('RABBIT_CONNECTION_URL') as string],
                queue: Queue.NEST,
                prefetchCount: 1,
                queueOptions: {
                    durable: true,
                } as AmqplibQueueOptions
            },
        }
    );

    await configContext.close();

    await app.listen();
    bootstrapLogger.log('Server is listening...');
}

bootstrap();
