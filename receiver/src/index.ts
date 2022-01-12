import {connect} from 'amqplib';
import {Environment} from './interfaces/environment.interface';
import {getEnv} from './helpers/get-env.helper';
import {Exchange} from './enums/exchange.enum';
import {parseArgument} from './helpers/parse-argument.helper';

const {RABBIT_PORT, RABBIT_USER, RABBIT_PASSWORD, RABBIT_HOST} = getEnv<Environment>();

async function main() {
    const url = `amqp://${RABBIT_USER}:${RABBIT_PASSWORD}@${RABBIT_HOST}:${RABBIT_PORT}`;

    console.log(`Connecting to ${url}...`);
    const connection = await connect(url);

    const channel = await connection.createChannel();

    const {exchange} = await channel.assertExchange(Exchange.ROUTING, 'direct', {
        durable: false,
    });

    const {queue} = await channel.assertQueue('', {
        exclusive: true,
    });

    console.log(`${queue} queue asserted!`);

    const type = parseArgument('-t') || '';

    await channel.bindQueue(queue, exchange, type);

    await channel.consume(queue, (message) => {
        if (message.content) {
            console.log(`[${type || 'Any'}] New message: ${message.content.toString()}`);
        }
    }, {noAck: true});
}

main()
    .catch((err) => console.error(err));
