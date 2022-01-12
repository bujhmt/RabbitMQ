export function getEnv(): string {
    if (process.env.NODE_ENV) {
        return `.env.${process.env.NODE_ENV}`;
    }

    return '.env.development';
}
