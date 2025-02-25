import { isObjectLike } from 'lodash-es';
export function deepMap(object, iterator, context) {
    if (Array.isArray(object)) {
        return object.map(function (val, key) {
            return isObjectLike(val) ? deepMap(val, iterator, context) : iterator.call(context, val, key);
        });
    }
    else if (isObjectLike(object)) {
        const res = {};
        for (const key in object) {
            const val = object[key];
            if (isObjectLike(val)) {
                res[key] = deepMap(val, iterator, context);
            }
            else {
                res[key] = iterator.call(context, val, key);
            }
        }
        return res;
    }
    else {
        return object;
    }
}
