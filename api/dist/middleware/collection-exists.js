/**
 * Check if requested collection exists, and save it to req.collection
 */
import { systemCollectionRows } from '../database/system-data/collections/index.js';
import { ForbiddenError } from '../errors/index.js';
import asyncHandler from '../utils/async-handler.js';
const collectionExists = asyncHandler(async (req, _res, next) => {
    if (!req.params['collection'])
        return next();
    if (req.params['collection'] in req.schema.collections === false) {
        throw new ForbiddenError();
    }
    req.collection = req.params['collection'];
    if (req.collection.startsWith('directus_')) {
        const systemRow = systemCollectionRows.find((collection) => {
            return collection?.collection === req.collection;
        });
        req.singleton = !!systemRow?.singleton;
    }
    else {
        req.singleton = req.schema.collections[req.collection]?.singleton ?? false;
    }
    return next();
});
export default collectionExists;
