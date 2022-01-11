import {DotenvParseOutput} from 'dotenv';

export interface Environment extends DotenvParseOutput{
    RABBIT_USER: string;
    RABBIT_PASSWORD: string;
    RABBIT_HOST: string;
    RABBIT_PORT: string;
}
