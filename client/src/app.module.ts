import {Module, OnModuleInit} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {ClientProxyFactory, RmqOptions, Transport} from '@nestjs/microservices';
import {resolve} from 'path';
import {CLIENT_PROXY} from './constants';
import {Environment} from './interfaces/environment.interface';
import {Queue} from './enums/queue.enum';
import {AppService} from './app.service';
import {AmqplibQueueOptions} from '@nestjs/microservices/external/rmq-url.interface';
import {getEnv} from './helpers/get-env.helper';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            expandVariables: true,
            envFilePath: resolve(__dirname, '..', 'config', getEnv())
        }),
    ],
    providers: [
        AppService,
        {
            provide: CLIENT_PROXY,
            useFactory: (configService: ConfigService<Environment>) => {
                return ClientProxyFactory.create({
                    transport: Transport.RMQ,
                    options: {
                        urls: [configService.get('RABBIT_CONNECTION_URL')],
                        queue: Queue.NEST,
                        queueOptions: {
                            durable: true,
                        } as AmqplibQueueOptions
                    }
                } as RmqOptions)
            },
            inject: [ConfigService],
        }
    ]
})
export class AppModule implements OnModuleInit {
    constructor(
        private readonly appService: AppService,
    ) {
    }

    onModuleInit() {
        this.appService.startPolling();
    }
}
