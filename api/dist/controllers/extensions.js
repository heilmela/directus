import { EXTENSION_TYPES } from '@directus/constants';
import { depluralize, isIn } from '@directus/utils';
import { Router } from 'express';
import env from '../env.js';
import { RouteNotFoundError } from '../errors/index.js';
import { getExtensionManager } from '../extensions.js';
import { respond } from '../middleware/respond.js';
import asyncHandler from '../utils/async-handler.js';
import { getCacheControlHeader } from '../utils/get-cache-headers.js';
import { getMilliseconds } from '../utils/get-milliseconds.js';
const router = Router();
router.get('/:type', asyncHandler(async (req, res, next) => {
    const type = depluralize(req.params['type']);
    if (!isIn(type, EXTENSION_TYPES)) {
        throw new RouteNotFoundError({ path: req.path });
    }
    const extensionManager = getExtensionManager();
    const extensions = extensionManager.getExtensionsList(type);
    res.locals['payload'] = {
        data: extensions,
    };
    return next();
}), respond);
router.get('/sources/:chunk', asyncHandler(async (req, res) => {
    const chunk = req.params['chunk'];
    const extensionManager = getExtensionManager();
    let source;
    if (chunk === 'index.js') {
        source = extensionManager.getAppExtensions();
    }
    else {
        source = extensionManager.getAppExtensionChunk(chunk);
    }
    if (source === null) {
        throw new RouteNotFoundError({ path: req.path });
    }
    res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    res.setHeader('Cache-Control', getCacheControlHeader(req, getMilliseconds(env['EXTENSIONS_CACHE_TTL']), false, false));
    res.setHeader('Vary', 'Origin, Cache-Control');
    res.end(source);
}));
export default router;
