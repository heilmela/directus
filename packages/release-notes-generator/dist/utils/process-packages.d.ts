import type { PackageVersion } from '../types.js';
export declare function processPackages(): Promise<{
    mainVersion: string | undefined;
    packageVersions: PackageVersion[];
}>;
