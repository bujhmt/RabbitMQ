import {connect} from 'amqplib';
import {Environment} from './interfaces/environment.interface';
import {getEnv} from './helpers/get-env.helper';
import {parseArgument} from './helpers/parse-argument.helper';
import {Exchange} from './enums/exchange.enum';

const {RABBIT_PORT, RABBIT_USER, RABBIT_PASSWORD, RABBIT_HOST} = getEnv<Environment>();

async function main() {
    const url = `amqp://${RABBIT_USER}:${RABBIT_PASSWORD}@${RABBIT_HOST}:${RABBIT_PORT}`;

    console.log(`Connecting to ${url}...`);
    const connection = await connect(url);

    const channel = await connection.createChannel();

    const {exchange} = await channel.assertExchange(Exchange.ROUTING, 'direct', {
        durable: false,
    });

    const message = parseArgument('-m') || 'Ping';
    const type = parseArgument('-t') || '';

    if (channel.publish(exchange, type, Buffer.from(message))) {
        console.log('Message sent!');
    }

    setTimeout(async () => {
        await channel.close();
        process.exit(0);
    });
}

main()
    .catch((err) => console.error(err));
