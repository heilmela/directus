import { D as DirectusClient } from '../client-e8d6bf91.js';
import { A as AuthenticationMode, c as AuthenticationConfig, d as AuthenticationClient, S as StaticTokenClient, b as AuthenticationStorage } from '../login-0506af09.js';
export { a as AuthenticationData } from '../login-0506af09.js';

/**
 * Creates a client to authenticate with Directus.
 *
 * @param mode AuthenticationMode
 * @param config The optional configuration.
 *
 * @returns A Directus authentication client.
 */
declare const authentication: (mode?: AuthenticationMode, config?: AuthenticationConfig) => <Schema extends object>(client: DirectusClient<Schema>) => AuthenticationClient<Schema>;

/**
 * Creates a client to authenticate with Directus using a static token.
 *
 * @param token static token.
 *
 * @returns A Directus static token client.
 */
declare const staticToken: (access_token: string) => <Schema extends object>(_client: DirectusClient<Schema>) => StaticTokenClient<Schema>;

/**
 * Simple memory storage implementation
 *
 * @returns AuthenticationStorage
 */
declare const memoryStorage: () => AuthenticationStorage;

export { AuthenticationClient, AuthenticationConfig, AuthenticationMode, AuthenticationStorage, StaticTokenClient, authentication, memoryStorage, staticToken };
