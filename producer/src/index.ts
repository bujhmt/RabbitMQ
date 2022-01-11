import {connect} from 'amqplib';
import {parse} from 'dotenv';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {Queue} from './enums/queue.enum';
import {Environment} from './interfaces/environment.interface';

const {RABBIT_PORT, RABBIT_USER, RABBIT_PASSWORD, RABBIT_HOST} = parse<Environment>(
    readFileSync(resolve(__dirname, '..', 'config', `.env`))
);

async function main() {
    const url = `amqp://${RABBIT_USER}:${RABBIT_PASSWORD}@${RABBIT_HOST}:${RABBIT_PORT}`;

    console.log(`Connecting to ${url}...`);
    const connection = await connect(url);

    const channel = await connection.createChannel();

    const {queue, consumerCount, messageCount} = await channel.assertQueue(Queue.DEFAULT, {
        durable: false,
    });

    console.log(`${queue} queue asserted! Consumers: ${consumerCount}, total messages: ${messageCount}`);

    const message = 'Hello RabbitMQ!';

    if (channel.sendToQueue(Queue.DEFAULT, Buffer.from(message))) {
        console.log(`[${queue}] Message was sent!`);
    }
}

main()
    .catch((err) => console.error(err));
