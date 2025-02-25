/**
 * Returns the input source object with the defaults applied
 *
 * @example
 * ```js
 * type Example = {
 * 	optional?: boolean;
 * 	required: boolean;
 * }
 * const input: Example = { required: true };
 * const output = defaults(input, { optional: false });
 * // => { required: true, optional: false }
 * ```
 */
export declare const defaults: <T extends object>(obj: T, def: Required<Pick<T, Exclude<keyof T, Exclude<{ [K in keyof T]: T[K] extends Exclude<T[keyof T], undefined> ? K : never; }[keyof T], undefined>>>>) => Required<T>;
