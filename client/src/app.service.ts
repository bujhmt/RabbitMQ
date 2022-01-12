import {Inject, Injectable, Logger} from '@nestjs/common';
import {ClientRMQ} from '@nestjs/microservices';
import {CLIENT_PROXY} from './constants';
import {Message} from './enums/message.enum';
import {take} from 'rxjs';

@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name);

    constructor(
        @Inject(CLIENT_PROXY) private readonly clientProxy: ClientRMQ,
    ) {
    }

    public startPolling() {
        let counter = 0;

        setInterval(() => {
            this.clientProxy.send<string>(Message.INFO, `Ping ${counter++}`)
                .pipe(take(1))
                .subscribe((data) => {
                    this.logger.log(`Response: ${data}`);
                });
        }, 1000);
    }
}
