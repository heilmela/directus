/** The root query to be executed */
interface AbstractQuery {
    /** Marked as entrypoint of the query */
    root: true;
    /** Location where the data is stored */
    store: string;
    /** Name of the collection entrypoint within the store */
    collection: string;
    /** All fields to select in the query */
    nodes: AbstractQueryFieldNode[];
    /** Optional attributes to perform a fine granular query */
    modifiers?: AbstractQueryModifiers;
}
type AbstractQueryNodeType = 'primitive' | 'fn' | 'm2o' | 'o2m' | 'a2o' | 'o2a';
/**
 * All nodes which can be used within the `nodes` array of the `AbstractQuery` have a type attribute.
 * With this in place it can easily be determined how to technically handle this field.
 * @see `AbstractQueryNodeType` for all possible types.
 */
interface AbstractQueryNode {
    /** the type of the node */
    type: AbstractQueryNodeType;
}
/**
 * A group of all possible field types.
 * This can be used within the `nodes` array of the `AbstractQuery`.
 */
type AbstractQueryFieldNode = AbstractQueryFieldNodePrimitive | AbstractQueryFieldNodeFn | AbstractQueryFieldNodeRelated;
/**
 * Generic primitive value read from the store field
 * @example
 * Let's say you want the engine to only return the `id` field of the collection in question:
 * For that you would create a node like the following and add it to the `nodes` of the query.
 * ```
 * const primitiveField: AbstractQueryFieldNodePrimitive = {
 * 	type: 'primitive',
 * 	field: 'attribute_xy'
 * }
 * ```
 */
interface AbstractQueryFieldNodePrimitive extends AbstractQueryNode {
    type: 'primitive';
    /** the name of the attribute */
    field: string;
    alias?: string;
}
type AbstractQueryFn = 'year' | 'month' | 'week' | 'day' | 'weekday' | 'hour' | 'minute' | 'second';
/**
 * Used to apply a function to a specific field before returning it.
 * @example
 * There are several functions available.
 * Let's say you want to only return the year of a date field:
 * ```js
 * const functionNode: AbstractQueryFieldNodeFn = {
 * 	type: 'fn',
 * 	fn: 'year',
 * 	targetNode: {
 * 	type: 'primitive',
 * 	field: 'date_created'
 * }
 * ```
 */
interface AbstractQueryFieldNodeFn extends AbstractQueryNode {
    type: 'fn';
    fn: AbstractQueryFn;
    targetNode: AbstractQueryFieldNodePrimitive | AbstractQueryFieldNodeFn;
    args?: (string | number | boolean)[];
    alias?: string;
}
/**
 * This is a basic interface for all relational field types.
 */
interface AbstractQueryFieldNodeRelatedBase {
    nodes: AbstractQueryFieldNode[];
    /** Regardless of the type of the relationship, it always possible to add modifiers to the foreign collection to adjust the results. */
    modifiers?: AbstractQueryModifiers;
    alias?: string;
}
/**
 * With those Used to build a relational query for m2o and o2m relations.
 */
type AbstractQueryFieldNodeRelated = AbstractQueryFieldNodeRelatedManyToOne | AbstractQueryFieldNodeRelatedOneToMany | AbstractQueryFieldNodeRelatedAnyToOne | AbstractQueryFieldNodeRelatedOneToAny;
/**
 * Used to build a relational query for m2o and o2m relations.
 * @example
 * ```
 * const functionNode = {
 * 	current: {
 * 		fields: ['id']
 *  },
 * 	external: {
 * 		store: 'mongodb',
 * 		collection: 'some-collection',
 * }
 * ```
 */
interface AbstractQueryFieldNodeRelatedJoinMany {
    /** the field of the current collection which has the relational value to an external collection or item */
    current: {
        fields: string[];
    };
    /** the external collection or item which should be pulled/joined/merged into the current collection */
    external: {
        store?: string;
        collection: string;
        fields: string[];
    };
}
interface AbstractQueryFieldNodeRelatedJoinAny {
    current: {
        collectionField: string;
        fields: string[];
    };
    external: {
        store?: string;
        fields: string[];
    };
}
interface AbstractQueryFieldNodeRelatedManyToOne extends AbstractQueryNode, AbstractQueryFieldNodeRelatedBase {
    type: 'm2o';
    join: AbstractQueryFieldNodeRelatedJoinMany;
}
interface AbstractQueryFieldNodeRelatedOneToMany extends AbstractQueryNode, AbstractQueryFieldNodeRelatedBase {
    type: 'o2m';
    join: AbstractQueryFieldNodeRelatedJoinMany;
}
interface AbstractQueryFieldNodeRelatedAnyToOne extends AbstractQueryNode, AbstractQueryFieldNodeRelatedBase {
    type: 'a2o';
    join: AbstractQueryFieldNodeRelatedJoinAny;
}
interface AbstractQueryFieldNodeRelatedOneToAny extends AbstractQueryNode, AbstractQueryFieldNodeRelatedBase {
    type: 'o2a';
    join: AbstractQueryFieldNodeRelatedJoinAny;
}
/**
 * Optional attributes to customize the query results
 */
interface AbstractQueryModifiers {
    limit?: AbstractQueryNodeLimit;
    offset?: AbstractQueryNodeOffset;
    sort?: AbstractQueryNodeSort[];
    filter?: AbstractQueryFilterNode;
}
interface AbstractQueryModifierNode {
    type: 'limit' | 'offset' | 'sort' | 'logical' | 'condition' | 'negate';
}
/**
 * Specifies the maximum amount of returning results
 */
interface AbstractQueryNodeLimit extends AbstractQueryModifierNode {
    type: 'limit';
    value: number;
}
/**
 * Specifies the number of items to skip before returning results
 */
interface AbstractQueryNodeOffset extends AbstractQueryModifierNode {
    type: 'offset';
    value: number;
}
type AbstractQueryNodeSortTargets = AbstractQueryFieldNodePrimitive | AbstractQueryFieldNodeFn | AbstractQueryFieldNodeRelatedManyToOne | AbstractQueryFieldNodeRelatedAnyToOne;
/**
 * Specifies the order of the result, f.e. for a primitive field.
 * @example
 * ```js
 * const sortNode = {
 * 		type: 'sort',
 * 		direction: 'ascending',
 * 		target: {
 * 			type: 'primitive',
 * 			field: 'attribute_xy'
 * 		}
 * }
 * ```
 * Alternatively a function can be applied a the field.
 * The result is then used for sorting.
 * @example
 * ```js
 * const sortNode = {
 * 		type: 'sort',
 * 		direction: 'ascending',
 * 		target: {
 * 			type: 'fn',
 * 			fn: 'year',
 * 			targetNode: {
 * 				type: 'primitive'
 * 				field: 'date_created'
 * 		}
 * }
 */
interface AbstractQueryNodeSort extends AbstractQueryModifierNode {
    type: 'sort';
    /** the desired order */
    direction: 'ascending' | 'descending';
    /** the node on which the sorting should be applied */
    target: AbstractQueryNodeSortTargets;
}
/**
 * Used to create logical operations.
 * @example
 * Let's say you want to only return rows where two conditions are true.
 * First condition that some field value needs to be qual to a provided value and another condition that one field is less than another provided value.
 * This would look like this:
 * ```
 * {
 * 	type: 'logical',
 * 	operator: 'and',
 * 	childNodes: [
 * 		{
 * 			type: 'condition',
 * 			operation: 'eq',
 * 			targetNode: { type: 'field', field: 'a' }
 * 			value: 5
 * 		},
 * 		{
 * 			type: 'condition',
 * 			operation: 'lt',
 * 			targetNode: { type: 'field', field: 'b' }
 * 			value: 28
 * 		}
 *  ]
 * }
 * ```
 * It is also possible to nest conditions with the logical operator.
 * ```
 * {
 * 	type: 'logical',
 * 	operator: 'and',
 * 	childNodes: [
 * 		{
 * 			type: 'condition',
 * 			operation: 'eq',
 * 			targetNode: { type: 'field', field: 'a' }
 * 			value: 5
 * 		},
 * 		{
 * 			type: 'logical',
 * 			operator: 'and',
 * 			childNodes: [
 * 				{
 * 					type: 'condition',
 * 					operation: 'eq',
 * 					targetNode: { type: 'field', field: 'b' }
 * 					value: 'something'
 * 				},
 * 				{
 * 					type: 'condition',
 * 					operation: 'gt',
 * 					targetNode: { type: 'field', field: 'c' }
 * 					value: true
 * 				}
 * 			],
 * 		}
 *  ]
 * }
 * ```
 */
type AbstractQueryFilterNode = AbstractQueryNodeLogical | AbstractQueryNodeNegate | AbstractQueryNodeCondition;
interface AbstractQueryNodeLogical extends AbstractQueryModifierNode {
    type: 'logical';
    operator: 'and' | 'or';
    /** the values for the the operation. */
    childNodes: AbstractQueryFilterNode[];
}
interface AbstractQueryNodeNegate extends AbstractQueryModifierNode {
    type: 'negate';
    /** the values for the the operation. */
    childNode: AbstractQueryFilterNode;
}
/**
 * Used to set conditions on a query. The item in question needs to match all conditions to be returned.
 * @example
 * ```
 * {
 * 		type: 'condition',
 * 		operation: 'lt',
 *		targetNode: { type: 'field', field: 'b' }
 * 		value: 5
 * }
 * ```
 */
interface AbstractQueryNodeCondition extends AbstractQueryModifierNode {
    type: 'condition';
    /** the node on which the condition should be applied */
    target: AbstractQueryFieldNodePrimitive | AbstractQueryFieldNodeFn | AbstractQueryFieldNodeRelatedManyToOne | AbstractQueryFieldNodeRelatedAnyToOne;
    /** the operation to perform on the target */
    operation: 'eq' | 'lt' | 'gt' | 'contains' | 'starts_with' | 'ends_with' | 'intersects' | 'intersects_bounding_box';
    compareTo: AbstractQueryNodeConditionValue;
}
interface AbstractQueryNodeConditionValue {
    type: 'value';
    value: string | number | boolean;
}

interface DataDriver {
    /**
     * When the driver is first registered. Can be used to warm up caches, prepare connections to
     * databases, login to external services, etc
     */
    register?: () => Promise<void>;
    /**
     * Fires when the driver is no longer needed. Can be used to disconnect databases, logout from
     * services, etc
     */
    destroy?: () => Promise<void>;
}
declare abstract class DataDriver {
    abstract query: (query: AbstractQuery) => Promise<NodeJS.ReadableStream>;
}

declare class DataEngine {
    #private;
    constructor();
    /** Registers a new data store for use in queries */
    registerStore(name: string, driver: DataDriver): Promise<void>;
    /** Access the driver of a given store. Errors if it hasn't been registered */
    store(name: string): DataDriver;
    /** Execute a root abstract query */
    query(query: AbstractQuery): Promise<NodeJS.ReadableStream>;
    /** Gracefully shutdown connected drivers */
    destroy(): Promise<void>;
}

export { AbstractQuery, AbstractQueryFieldNode, AbstractQueryFieldNodeFn, AbstractQueryFieldNodePrimitive, AbstractQueryFieldNodeRelated, AbstractQueryFieldNodeRelatedAnyToOne, AbstractQueryFieldNodeRelatedBase, AbstractQueryFieldNodeRelatedManyToOne, AbstractQueryFieldNodeRelatedOneToAny, AbstractQueryFieldNodeRelatedOneToMany, AbstractQueryFilterNode, AbstractQueryFn, AbstractQueryModifiers, AbstractQueryNodeCondition, AbstractQueryNodeConditionValue, AbstractQueryNodeLogical, AbstractQueryNodeNegate, AbstractQueryNodeSort, AbstractQueryNodeSortTargets, DataDriver, DataEngine };
