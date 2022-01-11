import {connect} from 'amqplib';
import {Queue} from './enums/queue.enum';
import {Environment} from './interfaces/environment.interface';
import {parseMessage} from './helpers/parse-message.helper';
import {Task} from "./interfaces/task.interface";
import {getEnv} from "./helpers/get-env.helper";

const {RABBIT_PORT, RABBIT_USER, RABBIT_PASSWORD, RABBIT_HOST, PREFETCH_COUNT} = getEnv<Environment>();

async function main() {
    const url = `amqp://${RABBIT_USER}:${RABBIT_PASSWORD}@${RABBIT_HOST}:${RABBIT_PORT}`;

    console.log(`Connecting to ${url}...`);
    const connection = await connect(url);

    const channel = await connection.createChannel();

    const {queue, messageCount} = await channel.assertQueue(Queue.TASK_QUEUES, {
        durable: true,
    });

    console.log(`${queue} queue asserted! Total messages: ${messageCount}`);
    await channel.prefetch(parseInt(PREFETCH_COUNT, 10));

    await channel.consume(Queue.TASK_QUEUES, (message) => {
        if (message) {
            const task = parseMessage<Task>(message);
            console.log(`[${Queue.TASK_QUEUES}] New message! Processing time: ${task.time}`);

            new Promise<string>((resolve) => {
                setTimeout(() => {
                    channel.ack(message);
                    resolve(task.message);
                }, task.time * 1000);
            })
                .then(
                    (result) => console.log(`[${Queue.TASK_QUEUES}] Message processed: ${result}`)
                )
                .catch(() => {
                    channel.nack(message);
                })
        }
    });
}

main()
    .catch((err) => console.error(err));
