import { validatePayload } from '@directus/utils';
import { FailedValidationError, joiValidationErrorItemToErrorExtensions } from '@directus/validation';
import { cloneDeep, flatten, isArray, isNil, merge, reduce, uniq, uniqWith } from 'lodash-es';
import { GENERATE_SPECIAL } from '../constants.js';
import getDatabase from '../database/index.js';
import { ForbiddenError } from '../errors/forbidden.js';
import { getRelationInfo } from '../utils/get-relation-info.js';
import { stripFunction } from '../utils/strip-function.js';
import { ItemsService } from './items.js';
import { PayloadService } from './payload.js';
export class AuthorizationService {
    knex;
    accountability;
    payloadService;
    schema;
    constructor(options) {
        this.knex = options.knex || getDatabase();
        this.accountability = options.accountability || null;
        this.schema = options.schema;
        this.payloadService = new PayloadService('directus_permissions', {
            knex: this.knex,
            schema: this.schema,
        });
    }
    async processAST(ast, action = 'read') {
        const collectionsRequested = getCollectionsFromAST(ast);
        const permissionsForCollections = uniqWith(this.accountability?.permissions?.filter((permission) => {
            return (permission.action === action &&
                collectionsRequested.map(({ collection }) => collection).includes(permission.collection));
        }), (curr, prev) => curr.collection === prev.collection && curr.action === prev.action && curr.role === prev.role) ?? [];
        // If the permissions don't match the collections, you don't have permission to read all of them
        const uniqueCollectionsRequestedCount = uniq(collectionsRequested.map(({ collection }) => collection)).length;
        if (uniqueCollectionsRequestedCount !== permissionsForCollections.length) {
            throw new ForbiddenError();
        }
        validateFields(ast);
        validateFilterPermissions(ast, this.schema, action, this.accountability);
        applyFilters(ast, this.accountability);
        return ast;
        /**
         * Traverses the AST and returns an array of all collections that are being fetched
         */
        function getCollectionsFromAST(ast) {
            const collections = [];
            if (ast.type === 'a2o') {
                collections.push(...ast.names.map((name) => ({ collection: name, field: ast.fieldKey })));
                for (const children of Object.values(ast.children)) {
                    for (const nestedNode of children) {
                        if (nestedNode.type !== 'field' && nestedNode.type !== 'functionField') {
                            collections.push(...getCollectionsFromAST(nestedNode));
                        }
                    }
                }
            }
            else {
                collections.push({
                    collection: ast.name,
                    field: ast.type === 'root' ? null : ast.fieldKey,
                });
                for (const nestedNode of ast.children) {
                    if (nestedNode.type === 'functionField') {
                        collections.push({
                            collection: nestedNode.relatedCollection,
                            field: null,
                        });
                    }
                    else if (nestedNode.type !== 'field') {
                        collections.push(...getCollectionsFromAST(nestedNode));
                    }
                }
            }
            return collections;
        }
        function validateFields(ast) {
            if (ast.type !== 'field' && ast.type !== 'functionField') {
                if (ast.type === 'a2o') {
                    for (const [collection, children] of Object.entries(ast.children)) {
                        checkFields(collection, children, ast.query?.[collection]?.aggregate);
                    }
                }
                else {
                    checkFields(ast.name, ast.children, ast.query?.aggregate);
                }
            }
            function checkFields(collection, children, aggregate) {
                // We check the availability of the permissions in the step before this is run
                const permissions = permissionsForCollections.find((permission) => permission.collection === collection);
                const allowedFields = permissions.fields || [];
                if (aggregate && allowedFields.includes('*') === false) {
                    for (const aliasMap of Object.values(aggregate)) {
                        if (!aliasMap)
                            continue;
                        for (const column of Object.values(aliasMap)) {
                            if (column === '*')
                                continue;
                            if (allowedFields.includes(column) === false)
                                throw new ForbiddenError();
                        }
                    }
                }
                for (const childNode of children) {
                    if (childNode.type !== 'field') {
                        validateFields(childNode);
                        continue;
                    }
                    if (allowedFields.includes('*'))
                        continue;
                    const fieldKey = stripFunction(childNode.name);
                    if (allowedFields.includes(fieldKey) === false) {
                        throw new ForbiddenError();
                    }
                }
            }
        }
        function validateFilterPermissions(ast, schema, action, accountability) {
            let requiredFieldPermissions = {};
            if (ast.type !== 'field' && ast.type !== 'functionField') {
                if (ast.type === 'a2o') {
                    for (const collection of Object.keys(ast.children)) {
                        requiredFieldPermissions = mergeRequiredFieldPermissions(requiredFieldPermissions, extractRequiredFieldPermissions(collection, ast.query?.[collection]?.filter ?? {}));
                        for (const child of ast.children[collection]) {
                            const childPermissions = validateFilterPermissions(child, schema, action, accountability);
                            if (Object.keys(childPermissions).length > 0) {
                                //Only add relational field if deep child has a filter
                                if (child.type !== 'field') {
                                    (requiredFieldPermissions[collection] || (requiredFieldPermissions[collection] = new Set())).add(child.fieldKey);
                                }
                                requiredFieldPermissions = mergeRequiredFieldPermissions(requiredFieldPermissions, childPermissions);
                            }
                        }
                    }
                }
                else {
                    requiredFieldPermissions = mergeRequiredFieldPermissions(requiredFieldPermissions, extractRequiredFieldPermissions(ast.name, ast.query?.filter ?? {}));
                    for (const child of ast.children) {
                        const childPermissions = validateFilterPermissions(child, schema, action, accountability);
                        if (Object.keys(childPermissions).length > 0) {
                            // Only add relational field if deep child has a filter
                            if (child.type !== 'field') {
                                (requiredFieldPermissions[ast.name] || (requiredFieldPermissions[ast.name] = new Set())).add(child.fieldKey);
                            }
                            requiredFieldPermissions = mergeRequiredFieldPermissions(requiredFieldPermissions, childPermissions);
                        }
                    }
                }
            }
            if (ast.type === 'root') {
                // Validate all required permissions once at the root level
                checkFieldPermissions(ast.name, schema, action, requiredFieldPermissions, ast.query.alias);
            }
            return requiredFieldPermissions;
            function extractRequiredFieldPermissions(collection, filter, parentCollection, parentField) {
                return reduce(filter, function (result, filterValue, filterKey) {
                    if (filterKey.startsWith('_')) {
                        if (filterKey === '_and' || filterKey === '_or') {
                            if (isArray(filterValue)) {
                                for (const filter of filterValue) {
                                    const requiredPermissions = extractRequiredFieldPermissions(collection, filter, parentCollection, parentField);
                                    result = mergeRequiredFieldPermissions(result, requiredPermissions);
                                }
                            }
                            return result;
                        }
                        // Filter value is not a filter, so we should skip it
                        return result;
                    }
                    // virtual o2m/o2a filter in the form of `$FOLLOW(...)`
                    else if (collection && filterKey.startsWith('$FOLLOW')) {
                        (result[collection] || (result[collection] = new Set())).add(filterKey);
                        // add virtual relation to the required permissions
                        const { relation } = getRelationInfo([], collection, filterKey);
                        if (relation?.collection && relation?.field) {
                            (result[relation.collection] || (result[relation.collection] = new Set())).add(relation.field);
                        }
                    }
                    // a2o filter in the form of `item:collection`
                    else if (filterKey.includes(':')) {
                        const [field, collectionScope] = filterKey.split(':');
                        if (collection) {
                            // Add the `item` field to the required permissions
                            (result[collection] || (result[collection] = new Set())).add(field);
                            // Add the `collection` field to the required permissions
                            result[collection].add('collection');
                        }
                        else {
                            const relation = schema.relations.find((relation) => {
                                return ((relation.collection === parentCollection && relation.field === parentField) ||
                                    (relation.related_collection === parentCollection && relation.meta?.one_field === parentField));
                            });
                            // Filter key not found in parent collection
                            if (!relation)
                                throw new ForbiddenError();
                            const relatedCollectionName = relation.related_collection === parentCollection ? relation.collection : relation.related_collection;
                            // Add the `item` field to the required permissions
                            (result[relatedCollectionName] || (result[relatedCollectionName] = new Set())).add(field);
                            // Add the `collection` field to the required permissions
                            result[relatedCollectionName].add('collection');
                        }
                        // Continue to parse the filter for nested `collection` afresh
                        const requiredPermissions = extractRequiredFieldPermissions(collectionScope, filterValue);
                        result = mergeRequiredFieldPermissions(result, requiredPermissions);
                    }
                    else {
                        if (collection) {
                            (result[collection] || (result[collection] = new Set())).add(filterKey);
                        }
                        else {
                            const relation = schema.relations.find((relation) => {
                                return ((relation.collection === parentCollection && relation.field === parentField) ||
                                    (relation.related_collection === parentCollection && relation.meta?.one_field === parentField));
                            });
                            // Filter key not found in parent collection
                            if (!relation)
                                throw new ForbiddenError();
                            parentCollection =
                                relation.related_collection === parentCollection ? relation.collection : relation.related_collection;
                            (result[parentCollection] || (result[parentCollection] = new Set())).add(filterKey);
                        }
                        if (typeof filterValue === 'object') {
                            // Parent collection is undefined when we process the top level filter
                            if (!parentCollection)
                                parentCollection = collection;
                            for (const [childFilterKey, childFilterValue] of Object.entries(filterValue)) {
                                if (childFilterKey.startsWith('_')) {
                                    if (childFilterKey === '_and' || childFilterKey === '_or') {
                                        if (isArray(childFilterValue)) {
                                            for (const filter of childFilterValue) {
                                                const requiredPermissions = extractRequiredFieldPermissions('', filter, parentCollection, filterKey);
                                                result = mergeRequiredFieldPermissions(result, requiredPermissions);
                                            }
                                        }
                                    }
                                }
                                else {
                                    const requiredPermissions = extractRequiredFieldPermissions('', filterValue, parentCollection, filterKey);
                                    result = mergeRequiredFieldPermissions(result, requiredPermissions);
                                }
                            }
                        }
                    }
                    return result;
                }, {});
            }
            function mergeRequiredFieldPermissions(current, child) {
                for (const collection of Object.keys(child)) {
                    if (!current[collection]) {
                        current[collection] = child[collection];
                    }
                    else {
                        current[collection] = new Set([...current[collection], ...child[collection]]);
                    }
                }
                return current;
            }
            function checkFieldPermissions(rootCollection, schema, action, requiredPermissions, aliasMap) {
                if (accountability?.admin === true)
                    return;
                for (const collection of Object.keys(requiredPermissions)) {
                    const permission = accountability?.permissions?.find((permission) => permission.collection === collection && permission.action === 'read');
                    let allowedFields;
                    // Allow the filtering of top level ID for actions such as update and delete
                    if (action !== 'read' && collection === rootCollection) {
                        const actionPermission = accountability?.permissions?.find((permission) => permission.collection === collection && permission.action === action);
                        if (!actionPermission || !actionPermission.fields) {
                            throw new ForbiddenError();
                        }
                        allowedFields = permission?.fields
                            ? [...permission.fields, schema.collections[collection].primary]
                            : [schema.collections[collection].primary];
                    }
                    else if (!permission || !permission.fields) {
                        throw new ForbiddenError();
                    }
                    else {
                        allowedFields = permission.fields;
                    }
                    if (allowedFields.includes('*'))
                        continue;
                    // Allow legacy permissions with an empty fields array, where id can be accessed
                    if (allowedFields.length === 0)
                        allowedFields.push(schema.collections[collection].primary);
                    for (const field of requiredPermissions[collection]) {
                        if (field.startsWith('$FOLLOW'))
                            continue;
                        const fieldName = stripFunction(field);
                        let originalFieldName = fieldName;
                        if (collection === rootCollection && aliasMap?.[fieldName]) {
                            originalFieldName = aliasMap[fieldName];
                        }
                        if (!allowedFields.includes(originalFieldName)) {
                            throw new ForbiddenError();
                        }
                    }
                }
            }
        }
        function applyFilters(ast, accountability) {
            if (ast.type === 'functionField') {
                const collection = ast.relatedCollection;
                updateFilterQuery(collection, ast.query);
            }
            else if (ast.type !== 'field') {
                if (ast.type === 'a2o') {
                    const collections = Object.keys(ast.children);
                    for (const collection of collections) {
                        updateFilterQuery(collection, ast.query[collection]);
                    }
                    for (const [collection, children] of Object.entries(ast.children)) {
                        ast.children[collection] = children.map((child) => applyFilters(child, accountability));
                    }
                }
                else {
                    const collection = ast.name;
                    updateFilterQuery(collection, ast.query);
                    ast.children = ast.children.map((child) => applyFilters(child, accountability));
                }
            }
            return ast;
            function updateFilterQuery(collection, query) {
                // We check the availability of the permissions in the step before this is run
                const permissions = permissionsForCollections.find((permission) => permission.collection === collection);
                if (!query.filter || Object.keys(query.filter).length === 0) {
                    query.filter = { _and: [] };
                }
                else {
                    query.filter = { _and: [query.filter] };
                }
                if (permissions.permissions && Object.keys(permissions.permissions).length > 0) {
                    query.filter._and.push(permissions.permissions);
                }
                if (query.filter._and.length === 0)
                    delete query.filter;
            }
        }
    }
    /**
     * Checks if the provided payload matches the configured permissions, and adds the presets to the payload.
     */
    validatePayload(action, collection, data) {
        const payload = cloneDeep(data);
        let permission;
        if (this.accountability?.admin === true) {
            permission = {
                id: 0,
                role: this.accountability?.role,
                collection,
                action,
                permissions: {},
                validation: {},
                fields: ['*'],
                presets: {},
            };
        }
        else {
            permission = this.accountability?.permissions?.find((permission) => {
                return permission.collection === collection && permission.action === action;
            });
            if (!permission)
                throw new ForbiddenError();
            // Check if you have permission to access the fields you're trying to access
            const allowedFields = permission.fields || [];
            if (allowedFields.includes('*') === false) {
                const keysInData = Object.keys(payload);
                const invalidKeys = keysInData.filter((fieldKey) => allowedFields.includes(fieldKey) === false);
                if (invalidKeys.length > 0) {
                    throw new ForbiddenError();
                }
            }
        }
        const preset = permission.presets ?? {};
        const payloadWithPresets = merge({}, preset, payload);
        const fieldValidationRules = Object.values(this.schema.collections[collection].fields)
            .map((field) => field.validation)
            .filter((v) => v);
        const hasValidationRules = isNil(permission.validation) === false && Object.keys(permission.validation ?? {}).length > 0;
        const hasFieldValidationRules = fieldValidationRules && fieldValidationRules.length > 0;
        const requiredColumns = [];
        for (const field of Object.values(this.schema.collections[collection].fields)) {
            const specials = field?.special ?? [];
            const hasGenerateSpecial = GENERATE_SPECIAL.some((name) => specials.includes(name));
            const nullable = field.nullable || hasGenerateSpecial || field.generated;
            if (!nullable) {
                requiredColumns.push(field);
            }
        }
        if (hasValidationRules === false && hasFieldValidationRules === false && requiredColumns.length === 0) {
            return payloadWithPresets;
        }
        if (requiredColumns.length > 0) {
            permission.validation = hasValidationRules ? { _and: [permission.validation] } : { _and: [] };
            for (const field of requiredColumns) {
                if (action === 'create' && field.defaultValue === null) {
                    permission.validation._and.push({
                        [field.field]: {
                            _submitted: true,
                        },
                    });
                }
                permission.validation._and.push({
                    [field.field]: {
                        _nnull: true,
                    },
                });
            }
        }
        if (hasFieldValidationRules) {
            if (permission.validation && Object.keys(permission.validation).length > 0) {
                permission.validation = { _and: [permission.validation, ...fieldValidationRules] };
            }
            else {
                permission.validation = { _and: fieldValidationRules };
            }
        }
        const validationErrors = [];
        validationErrors.push(...flatten(validatePayload(permission.validation, payloadWithPresets).map((error) => error.details.map((details) => new FailedValidationError(joiValidationErrorItemToErrorExtensions(details))))));
        if (validationErrors.length > 0)
            throw validationErrors;
        return payloadWithPresets;
    }
    async checkAccess(action, collection, pk) {
        if (this.accountability?.admin === true)
            return;
        const itemsService = new ItemsService(collection, {
            accountability: this.accountability,
            knex: this.knex,
            schema: this.schema,
        });
        const query = {
            fields: ['*'],
        };
        if (Array.isArray(pk)) {
            const result = await itemsService.readMany(pk, { ...query, limit: pk.length }, { permissionsAction: action });
            if (!result)
                throw new ForbiddenError();
            if (result.length !== pk.length)
                throw new ForbiddenError();
        }
        else {
            const result = await itemsService.readOne(pk, query, { permissionsAction: action });
            if (!result)
                throw new ForbiddenError();
        }
    }
}
