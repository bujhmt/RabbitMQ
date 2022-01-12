import {connect} from 'amqplib';
import {Queue} from './enums/queue.enum';
import {Environment} from './interfaces/environment.interface';
import {getEnv} from './helpers/get-env.helper';
import {parseArgument} from './helpers/parse-argument.helper';

const RETRY_TIME = 1000;

const {RABBIT_PORT, RABBIT_USER, RABBIT_PASSWORD, RABBIT_HOST} = getEnv<Environment>();

async function main() {
    const url = `amqp://${RABBIT_USER}:${RABBIT_PASSWORD}@${RABBIT_HOST}:${RABBIT_PORT}`;

    console.log(`Connecting to ${url}...`);
    const connection = await connect(url);

    const channel = await connection.createChannel();

    const callbackQueue = await channel.assertQueue('', {
        exclusive: true,
    });

    const correlationId = new Date().toISOString();

    await channel.consume(callbackQueue.queue, (message) => {
        if (message && message.properties.correlationId === correlationId) {
            console.log(`Response received: "${message.content.toString()}"`)
            setTimeout(() => {
                channel.close();
                process.exit(0);
            });
        }
    })

    const interval = setInterval(() => {
        if (
            channel.sendToQueue(
                Queue.RPC,
                Buffer.from(JSON.stringify({
                    time: parseInt(parseArgument('-t'), 10) || 0,
                    message: parseArgument('-m') || 'Ping!',
                })),
                {
                    correlationId,
                    replyTo: callbackQueue.queue,
                    persistent: true,
                }
            )
        ) {
            console.log('Message successfully sent!', '\nWaiting for response...');
            clearInterval(interval);
        } else {
            console.log('Failed to send a message! Retrying...')
        }
    }, RETRY_TIME);
}

main()
    .catch((err) => console.error(err));
