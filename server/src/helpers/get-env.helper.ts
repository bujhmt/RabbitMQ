import {DotenvParseOutput, parse} from 'dotenv';
import {readFileSync} from 'fs';
import {resolve} from 'path';

export function getEnv<T extends DotenvParseOutput>() {
    const data = readFileSync(
        resolve(__dirname, '../..', 'config', `.env`),
        {
            encoding: 'utf-8',
        }
    );

    return parse<T>(data)
}
