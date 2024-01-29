import { Paths } from 'bakutils-types';
/**Get a value from a deep nested object.
 * 
 * @param obj The object to search in.
 * @param path The path to the value, as an array of keys, separated by dots.
 * @returns The value, if found.
 * 
 * @example
 * 
 * ```ts
 * const obj = {a: {b: {c: {d: 2}}}};
 * const value = getDeepValue(obj, 'a.b.c.d'); //2 - And inferred as a number
 * ```
 */
export function getDeepValue<
    /**Inferred string path from the given object  */
    Path extends Paths<Obj, 8>,
    ReturnV extends any = unknown | undefined,
    Obj extends Record<any, any> = Record<any, any>>
    (nestedObj: Obj, path: Path, defaultValue = undefined as ReturnV): ReturnV {
    const pathAsArray = path?.split(".");
    try {
        return pathAsArray?.reduce((obj, key) => (obj && obj[key as string] !== 'undefined') ? obj[key as string] : defaultValue, nestedObj) as unknown as ReturnV;
    } catch (e) {
        console.error(e);
        return defaultValue;
    }
}

/**Tries to convert an ISO `string` to the locale format. 
 * @param date The date to convert.
 * @param locales The locale to convert
 * @param formatOptions `Intl.DateTimeFormatOptions` to use if desired.
 * @returns The converted date or the original date string if the conversion was not possible.
*/
export function convertIsoToLocaleString(
    date: string, locales: string | string[] = 'pt-BR',
    formatOptions: Intl.DateTimeFormatOptions | undefined = undefined): string {
    //First check if the string can be converted to a date object.
    if (!(new Date(date) instanceof Date) && isNaN(new Date(date)?.getTime())) return date;
    const isIsoDate = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z/.test(date);
    if (!isIsoDate) return date;
    return new Intl.DateTimeFormat(locales, formatOptions).format(new Date(date));
}