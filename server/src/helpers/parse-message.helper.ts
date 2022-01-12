import {ConsumeMessage} from 'amqplib/properties';

export function parseMessage<T = Record<string, any>>({content}: ConsumeMessage): T {
    return JSON.parse(content.toString());
}
