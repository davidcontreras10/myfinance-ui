export class Utils {
    public static toViewDateFormat(date: Date) {
        const year = date.getFullYear().toString().padStart(4, '0'); // get the year and pad with leading zeros
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // get the month and pad with leading zeros
        const day = date.getDate().toString().padStart(2, '0'); // get the day and pad with leading zeros
        const hours = date.getHours().toString().padStart(2, '0'); // get the hours and pad with leading zeros
        const minutes = date.getMinutes().toString().padStart(2, '0'); // get the minutes and pad with leading zeros
        return `${year}-${month}-${day}T${hours}:${minutes}`; // concatenate the values into a string with the desired format
    }

    public static deepClone<T>(object: T): T {
        return JSON.parse(JSON.stringify(object));
    }

    public static isValidId(id: number | string | undefined | null): boolean {
        return id !== undefined && id !== null && id !== 0;
    }

    public static validateId(id: number | string | undefined | null): number {
        if (!Utils.isValidId(id)) {
            throw new Error('Invalid id');
        }

        return id as number
    }

    public static isValidNumber(value: number | undefined | null): boolean {
        return typeof value === 'number' && !isNaN(value);
    }

    public static validateNumber(value: number | undefined | null): number {
        if (!Utils.isValidNumber(value)) {
            throw new Error('Invalid number');
        }

        return value as number;
    }
}