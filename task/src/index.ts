import {connect} from 'amqplib';
import {Queue} from './enums/queue.enum';
import {Environment} from './interfaces/environment.interface';
import {getEnv} from './helpers/get-env.helper';
import {parseArgument} from "./helpers/parse-argument.helper";

const RETRY_TIME = 1000;

const {RABBIT_PORT, RABBIT_USER, RABBIT_PASSWORD, RABBIT_HOST} = getEnv<Environment>();

async function main() {
    const url = `amqp://${RABBIT_USER}:${RABBIT_PASSWORD}@${RABBIT_HOST}:${RABBIT_PORT}`;

    console.log(`Connecting to ${url}...`);
    const connection = await connect(url);

    const channel = await connection.createChannel();

    await channel.assertQueue(Queue.TASK_QUEUES, {
        durable: true,
    });

    const interval = setInterval(() => {
        if (
            channel.sendToQueue(
                Queue.TASK_QUEUES,
                Buffer.from(JSON.stringify({
                    time: parseInt(parseArgument('-t'), 10) || 0,
                    message: parseArgument('-m') || 'Ping!',
                })),
                {
                    persistent: true,
                }
            )
        ) {
            console.log('Message successfully sent!');
            clearInterval(interval);
        } else {
            console.log('Failed to send a message! Retrying...')
        }
    }, RETRY_TIME);
}

main()
    .catch((err) => console.error(err));
