import {NestFactory} from '@nestjs/core';
import {Logger} from '@nestjs/common';
import {AppModule} from './app.module';

async function bootstrap() {
    const app = await NestFactory.createMicroservice(AppModule);

    await app.listen();
    Logger.log('Client bootstrapped', 'BOOTSTRAP');
}

bootstrap();
