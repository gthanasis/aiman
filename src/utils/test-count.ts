import chalk from "chalk";

/**
 * Process the test count parameter
 */
export function determineTestCount(testCountArg: string | undefined, defaultCount = 100) {
    if (testCountArg) {
        const countValue = testCountArg.split('=')[1];
        const parsedCount = parseInt(countValue, 10);
        if (!isNaN(parsedCount) && parsedCount > 0) {
            return parsedCount;
        } else {
            console.log(chalk.yellow(`Invalid test count: ${countValue}. Using default of 100.`));
            return defaultCount
        }
    } else {
        return defaultCount;
    }
}