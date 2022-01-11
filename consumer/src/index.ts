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

    const {queue, messageCount} = await channel.assertQueue(Queue.DEFAULT, {
        durable: false,
    });

    console.log(`${queue} queue asserted! Total messages: ${messageCount}`);

    await channel.consume(Queue.DEFAULT, (message) => {
        if (message) {
            console.log(`[${Queue.DEFAULT}] New message: ${message.content.toString()}`);
            channel.ack(message);
        }
    });
}

main()
    .catch((err) => console.error(err));
