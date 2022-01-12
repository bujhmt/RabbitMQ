export function parseArgument(flag: string): string | undefined {
    const index = process.argv.findIndex((value) => value === flag);

    if (index > 0 && index < process.argv.length) {
        return process.argv[index + 1];
    }
}
