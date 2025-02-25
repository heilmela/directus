type DirectusRevision<Schema extends object> = MergeCoreCollection<Schema, 'directus_revisions', {
    id: number;
    activity: DirectusActivity<Schema> | number;
    collection: string;
    item: string;
    data: Record<string, any> | null;
    delta: Record<string, any> | null;
    parent: DirectusRevision<Schema> | number | null;
}>;

type DirectusFolder<Schema extends object> = MergeCoreCollection<Schema, 'directus_folders', {
    id: string;
    name: string;
    parent: DirectusFolder<Schema> | string | null;
}>;

type DirectusFile<Schema extends object> = MergeCoreCollection<Schema, 'directus_files', {
    id: string;
    storage: string;
    filename_disk: string | null;
    filename_download: string;
    title: string | null;
    type: string | null;
    folder: DirectusFolder<Schema> | string | null;
    uploaded_by: DirectusUser<Schema> | string | null;
    uploaded_on: string;
    modified_by: DirectusUser<Schema> | string | null;
    modified_on: string;
    charset: string | null;
    filesize: string | null;
    width: number | null;
    height: number | null;
    duration: number | null;
    embed: unknown | null;
    description: string | null;
    location: string | null;
    tags: string[] | null;
    metadata: Record<string, any> | null;
}>;

/**
 * directus_users type
 */
type DirectusUser<Schema extends object> = MergeCoreCollection<Schema, 'directus_users', {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    password: string | null;
    location: string | null;
    title: string | null;
    description: string | null;
    tags: string[] | null;
    avatar: DirectusFile<Schema> | string | null;
    language: string | null;
    theme: string | null;
    tfa_secret: string | null;
    status: string;
    role: string | null;
    token: string | null;
    last_access: string | null;
    last_page: string | null;
    provider: string;
    external_identifier: string | null;
    auth_data: Record<string, any> | null;
    email_notifications: boolean | null;
}>;

type DirectusActivity<Schema extends object> = MergeCoreCollection<Schema, 'directus_activity', {
    id: number;
    action: string;
    user: DirectusUser<Schema> | string | null;
    timestamp: string;
    ip: string | null;
    user_agent: string | null;
    collection: string;
    item: string;
    comment: string | null;
    origin: string | null;
    revisions: DirectusRevision<Schema>[] | number[] | null;
}>;

type DirectusCollection<Schema extends object> = {
    collection: string;
    meta: MergeCoreCollection<Schema, 'directus_collections', {
        collection: string;
        icon: string | null;
        note: string | null;
        display_template: string | null;
        hidden: boolean;
        singleton: boolean;
        translations: CollectionMetaTranslationType[] | null;
        archive_field: string | null;
        archive_app_filter: boolean;
        archive_value: string | null;
        unarchive_value: string | null;
        sort_field: string | null;
        accountability: string | null;
        color: string | null;
        item_duplication_fields: string[] | null;
        sort: string | null;
        group: string | null;
        collapse: string;
        preview_url: string | null;
    }>;
    schema: {
        schema: string;
        name: string;
        comment: string | null;
    } | null;
};
type CollectionMetaTranslationType = {
    language: string;
    plural: string;
    singular: string;
    translation: string;
};

type DirectusDashboard<Schema extends object> = MergeCoreCollection<Schema, 'directus_dashboards', {
    id: string;
    name: string;
    icon: string;
    note: string | null;
    date_created: string | null;
    user_created: DirectusUser<Schema> | string | null;
    color: string | null;
}>;

type DirectusField<Schema extends object> = {
    collection: string;
    field: string;
    type: string;
    meta: MergeCoreCollection<Schema, 'directus_fields', {
        id: number;
        collection: string;
        field: string;
        special: string[] | null;
        interface: string | null;
        options: Record<string, any> | null;
        display: string | null;
        display_options: Record<string, any> | null;
        readonly: boolean;
        hidden: boolean;
        sort: number | null;
        width: string | null;
        translations: FieldMetaTranslationType[] | null;
        note: string | null;
        conditions: FieldMetaConditionType[] | null;
        required: boolean;
        group: string | null;
        validation: Record<string, any> | null;
        validation_message: string | null;
    }>;
    schema: {
        name: string;
        table: string;
        schema: string;
        data_type: string;
        is_nullable: boolean;
        generation_expression: unknown | null;
        default_value: any | null;
        is_generated: boolean;
        max_length: number | null;
        comment: string | null;
        numeric_precision: number | null;
        numeric_scale: number | null;
        is_unique: boolean;
        is_primary_key: boolean;
        has_auto_increment: boolean;
        foreign_key_schema: string | null;
        foreign_key_table: string | null;
        foreign_key_column: string | null;
    };
};
type FieldMetaConditionType = {
    hidden: boolean;
    name: string;
    options: FieldMetaConditionOptionType;
    readonly: boolean;
    required: boolean;
    rule: unknown;
};
type FieldMetaConditionOptionType = {
    clear: boolean;
    font: string;
    iconLeft?: string;
    iconRight?: string;
    masked: boolean;
    placeholder: string;
    slug: boolean;
    softLength?: number;
    trim: boolean;
};
type FieldMetaTranslationType = {
    language: string;
    translation: string;
};

type DirectusOperation<Schema extends object> = MergeCoreCollection<Schema, 'directus_operations', {
    id: string;
    name: string | null;
    key: string;
    type: string;
    position_x: number;
    position_y: number;
    timestamp: string;
    options: Record<string, any> | null;
    resolve: DirectusOperation<Schema> | string | null;
    reject: DirectusOperation<Schema> | string | null;
    flow: DirectusFlow<Schema> | string;
    date_created: string | null;
    user_created: DirectusUser<Schema> | string | null;
}>;

type DirectusFlow<Schema extends object> = MergeCoreCollection<Schema, 'directus_flows', {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
    description: string | null;
    status: string;
    trigger: string | null;
    accountability: string | null;
    options: Record<string, any> | null;
    operation: DirectusOperation<Schema> | string | null;
    date_created: string | null;
    user_created: DirectusUser<Schema> | string | null;
}>;

type DirectusNotification<Schema extends object> = MergeCoreCollection<Schema, 'directus_notifications', {
    id: string;
    timestamp: string | null;
    status: string | null;
    recipient: DirectusUser<Schema> | string;
    sender: DirectusUser<Schema> | string | null;
    subject: string;
    message: string | null;
    collection: string | null;
    item: string | null;
}>;

type DirectusPanel<Schema extends object> = MergeCoreCollection<Schema, 'directus_panels', {
    id: string;
    dashboard: DirectusDashboard<Schema> | string;
    name: string | null;
    icon: string | null;
    color: string | null;
    show_header: boolean;
    note: string | null;
    type: string;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
    options: Record<string, any> | null;
    date_created: string | null;
    user_created: DirectusUser<Schema> | string | null;
}>;

type DirectusRole<Schema extends object> = MergeCoreCollection<Schema, 'directus_roles', {
    id: string;
    name: string;
    icon: string;
    description: string | null;
    ip_access: string | null;
    enforce_tfa: boolean;
    admin_access: boolean;
    app_access: boolean;
}>;

type DirectusPermission<Schema extends object> = MergeCoreCollection<Schema, 'directus_permissions', {
    id: number;
    role: DirectusRole<Schema> | string | null;
    collection: string;
    action: string;
    permissions: Record<string, any> | null;
    validation: Record<string, any> | null;
    presets: Record<string, any> | null;
    fields: string | null;
}>;

type DirectusPreset<Schema extends object> = MergeCoreCollection<Schema, 'directus_presets', {
    id: number;
    bookmark: string | null;
    user: DirectusUser<Schema> | string | null;
    role: DirectusRole<Schema> | string | null;
    collection: string | null;
    search: string | null;
    layout: string | null;
    layout_query: Record<string, any> | null;
    layout_options: Record<string, any> | null;
    refresh_interval: number | null;
    filter: Record<string, any> | null;
    icon: string | null;
    color: string | null;
}>;

type DirectusRelation<Schema extends object> = {
    collection: string;
    field: string;
    related_collection: string;
    meta: MergeCoreCollection<Schema, 'directus_relations', {
        id: number;
        junction_field: string | null;
        many_collection: string | null;
        many_field: string | null;
        one_allowed_collections: string | null;
        one_collection: string | null;
        one_collection_field: string | null;
        one_deselect_action: string;
        one_field: string | null;
        sort_field: string | null;
        system: boolean | null;
    }>;
    schema: {
        column: string;
        constraint_name: string;
        foreign_key_column: string;
        foreign_key_schema: string;
        foreign_key_table: string;
        on_delete: string;
        on_update: string;
        table: string;
    };
};

type DirectusSettings<Schema extends object> = MergeCoreCollection<Schema, 'directus_settings', {
    id: 1;
    project_name: string;
    project_url: string;
    project_color: string | null;
    project_logo: string | null;
    public_foreground: string | null;
    public_background: string | null;
    public_note: string | null;
    auth_login_attempts: number;
    auth_password_policy: string | null;
    storage_asset_transform: 'all' | 'none' | 'presets';
    storage_asset_presets: {
        fit: string;
        height: number;
        width: number;
        quality: number;
        key: string;
        withoutEnlargement: boolean;
    }[] | null;
    custom_css: string | null;
    storage_default_folder: DirectusFolder<Schema> | string | null;
    basemaps: Record<string, any> | null;
    mapbox_key: string | null;
    module_bar: any | null;
    project_descriptor: string | null;
    default_language: string;
    custom_aspect_ratios: Record<string, any> | null;
}>;

type DirectusShare<Schema extends object> = MergeCoreCollection<Schema, 'directus_shares', {
    id: string;
    name: string | null;
    collection: string | null;
    item: string | null;
    role: DirectusRole<Schema> | string | null;
    password: string | null;
    user_created: DirectusUser<Schema> | string | null;
    date_created: string | null;
    date_start: string | null;
    date_end: string | null;
    times_used: number | null;
    max_uses: number | null;
}>;

type DirectusWebhook<Schema extends object> = MergeCoreCollection<Schema, 'directus_webhooks', {
    id: number;
    name: string;
    method: string;
    url: string;
    status: string;
    data: boolean;
    actions: string | string[];
    collections: string | string[];
    headers: Record<string, any> | null;
}>;

interface CoreSchema<Schema extends object = object> {
    directus_activity: DirectusActivity<Schema>[];
    directus_collections: DirectusCollection<Schema>[];
    directus_dashboards: DirectusDashboard<Schema>[];
    directus_fields: DirectusField<Schema>[];
    directus_files: DirectusFile<Schema>[];
    directus_flows: DirectusFlow<Schema>[];
    directus_folders: DirectusFolder<Schema>[];
    directus_notifications: DirectusNotification<Schema>[];
    directus_operations: DirectusOperation<Schema>[];
    directus_panels: DirectusPanel<Schema>[];
    directus_permissions: DirectusPermission<Schema>[];
    directus_presets: DirectusPreset<Schema>[];
    directus_relations: DirectusRelation<Schema>[];
    directus_roles: DirectusRole<Schema>[];
    directus_settings: DirectusSettings<Schema>;
    directus_shares: DirectusShare<Schema>[];
    directus_users: DirectusUser<Schema>[];
    directus_webhooks: DirectusWebhook<Schema>[];
}

/**
 * Makes types mutable
 */
type Mutable<T> = T extends object ? {
    -readonly [K in keyof T]: Mutable<T[K]>;
} : T;
/**
 * Flatten array types to their singular root
 */
type UnpackList<Item> = Item extends any[] ? Item[number] : Item;
/**
 * Merge two object types with never guard
 */
type Merge<A, B, TypeA = NeverToUnknown<A>, TypeB = NeverToUnknown<B>> = {
    [K in keyof TypeA | keyof TypeB]: K extends keyof TypeA & keyof TypeB ? TypeA[K] | TypeB[K] : K extends keyof TypeB ? TypeB[K] : K extends keyof TypeA ? TypeA[K] : never;
};
/**
 * Fallback never to unknown
 */
type NeverToUnknown<T> = [T] extends [never] ? unknown : T;
/**
 * Test for any
 */
type IfAny<T, Y, N> = 0 extends 1 & T ? Y : N;
type IsAny<T> = IfAny<T, true, never>;
type IsNullable<T, Y = true, N = never> = T | null extends T ? Y : N;
type NestedPartial<Item extends object> = {
    [Key in keyof Item]?: Item[Key] extends object ? NestedPartial<Item[Key]> : Item[Key];
};

/**
 * Get all available top level Item types from a given Schema
 */
type ItemType<Schema extends object> = Schema[keyof Schema] | {
    [K in keyof Schema]: Schema[K] extends any[] ? Schema[K][number] : never;
}[keyof Schema];
/**
 * Return singular collection type
 */
type CollectionType<Schema extends object, Collection> = IfAny<Schema, any, Collection extends keyof Schema ? UnpackList<Schema[Collection]> extends object ? UnpackList<Schema[Collection]> : never : never>;
/**
 * Returns a list of singleton collections in the schema
 */
type SingletonCollections<Schema extends object> = {
    [Key in keyof Schema]: Schema[Key] extends any[] ? never : Key;
}[keyof Schema];
/**
 * Returns a list of regular collections in the schema
 */
type RegularCollections<Schema extends object> = IfAny<Schema, string, Exclude<keyof Schema, SingletonCollections<Schema>>>;
/**
 * Return string keys of all Primitive fields in the given schema Item
 */
type PrimitiveFields<Schema extends object, Item> = {
    [Key in keyof Item]: Extract<Item[Key], ItemType<Schema>> extends never ? Key : never;
}[keyof Item];
/**
 * Return string keys of all Relational fields in the given schema Item
 */
type RelationalFields<Schema extends object, Item> = {
    [Key in keyof Item]: Extract<Item[Key], ItemType<Schema>> extends never ? never : Key;
}[keyof Item];
/**
 * Remove the related Item types from relational m2o/a2o fields
 */
type RemoveRelationships<Schema extends object, Item> = {
    [Key in keyof Item]: Exclude<Item[Key], ItemType<Schema>>;
};
/**
 * Merge a core collection from the schema with the builtin schema
 */
type MergeCoreCollection<Schema extends object, Collection extends keyof Schema | string, BuiltinCollection> = Collection extends keyof Schema ? UnpackList<Schema[Collection]> extends infer Item ? {
    [Field in Exclude<keyof Item, keyof BuiltinCollection>]: Item[Field];
} & BuiltinCollection : never : BuiltinCollection;
/**
 * Merge custom and core schema objects
 */
type CompleteSchema<Schema extends object> = CoreSchema<Schema> extends infer Core ? {
    [Collection in keyof Schema | keyof Core]: Collection extends keyof Core ? Core[Collection] : Collection extends keyof Schema ? Schema[Collection] : never;
} : never;
/**
 * Merge custom schema with core schema
 */
type AllCollections<Schema extends object> = RegularCollections<Schema> | RegularCollections<CoreSchema<Schema>>;
/**
 * Helper to extract a collection with fallback to defaults
 */
type GetCollection<Schema extends object, CollectionName extends AllCollections<Schema>> = CollectionName extends keyof CoreSchema<Schema> ? CoreSchema<Schema>[CollectionName] : CollectionName extends keyof Schema ? Schema[CollectionName] : never;
/**
 * Helper to extract a collection name
 */
type GetCollectionName<Schema extends object, Collection, FullSchema extends object = CompleteSchema<Schema>> = {
    [K in keyof FullSchema]: UnpackList<FullSchema[K]> extends Collection ? K : never;
}[keyof FullSchema];

/**
 * Deep filter object
 */
type QueryDeep<Schema extends object, Item> = UnpackList<Item> extends infer FlatItem ? RelationalFields<Schema, FlatItem> extends never ? never : {
    [Field in RelationalFields<Schema, FlatItem> as ExtractCollection<Schema, FlatItem[Field]> extends any[] ? Field : never]?: ExtractCollection<Schema, FlatItem[Field]> extends infer CollectionItem ? Query<Schema, CollectionItem> extends infer TQuery ? MergeObjects<QueryDeep<Schema, CollectionItem>, {
        [Key in keyof Omit<TQuery, 'deep' | 'alias' | 'fields'> as `_${string & Key}`]: TQuery[Key];
    }> : never : never;
} : never;
type ExtractCollection<Schema extends object, Item> = Extract<Item, ItemType<Schema>>;

/**
 * Fields querying, including nested relational fields
 */
type QueryFields<Schema extends object, Item> = WrapQueryFields<Item, QueryFieldsRelational<Schema, UnpackList<Item>>>;
/**
 * Wrap array of fields
 */
type WrapQueryFields<Item, NestedFields> = readonly ('*' | keyof UnpackList<Item> | NestedFields)[];
/**
 * Object of nested relational fields in a given Item with it's own fields available for selection
 */
type QueryFieldsRelational<Schema extends object, Item> = {
    [Key in RelationalFields<Schema, Item>]?: Extract<Item[Key], ItemType<Schema>> extends infer RelatedCollection ? RelatedCollection extends any[] ? HasManyToAnyRelation<RelatedCollection> extends never ? QueryFields<Schema, RelatedCollection> : ManyToAnyFields<Schema, RelatedCollection> : QueryFields<Schema, RelatedCollection> : never;
};
/**
 * Deal with many-to-any relational fields
 */
type ManyToAnyFields<Schema extends object, Item> = ExtractItem<Schema, Item> extends infer TItem ? TItem extends object ? 'collection' extends keyof TItem ? 'item' extends keyof TItem ? WrapQueryFields<TItem, Omit<QueryFieldsRelational<Schema, UnpackList<Item>>, 'item'> & {
    item?: {
        [Collection in keyof Schema as Collection extends TItem['collection'] ? Collection : never]?: QueryFields<Schema, Schema[Collection]>;
    };
}> : never : never : never : never;
/**
 * Determine whether a field definition has a many-to-any relation
 * TODO try making this dynamic somehow instead of relying on "item" as key
 */
type HasManyToAnyRelation<Item> = UnpackList<Item> extends infer TItem ? TItem extends object ? 'collection' extends keyof TItem ? 'item' extends keyof TItem ? true : never : never : never : never;
/**
 * Returns true if the Fields has any nested field
 */
type HasNestedFields<Fields> = UnpackList<Fields> extends infer Field ? Field extends object ? true : never : never;
/**
 * Return all keys if Fields is undefined or contains '*'
 */
type FieldsWildcard<Item extends object, Fields> = UnpackList<Fields> extends infer Field ? Field extends undefined ? keyof Item : Field extends '*' ? keyof Item : Field extends string ? Field : never : never;
/**
 * Returns the relational fields from the fields list
 */
type PickRelationalFields<Fields> = UnpackList<Fields> extends infer Field ? Field extends object ? Field : never : never;
type RelationalQueryFields<Fields> = PickRelationalFields<Fields>;
/**
 * Extract the required fields from an item
 */
type PickFlatFields<Schema extends object, Item, Fields> = Extract<Fields, keyof Item> extends never ? never : Pick<RemoveRelationships<Schema, Item>, Extract<Fields, keyof Item>>;

/**
 * Filters
 */
type QueryFilter<Schema extends object, Item> = WrapLogicalFilters<NestedQueryFilter<Schema, Item>>;
/**
 * Query filters without logical filters
 */
type NestedQueryFilter<Schema extends object, Item> = UnpackList<Item> extends infer FlatItem ? {
    [Field in keyof FlatItem]?: (Field extends RelationalFields<Schema, FlatItem> ? WrapRelationalFilters<NestedQueryFilter<Schema, FlatItem[Field]>> : never) | FilterOperators<FlatItem[Field]>;
} : never;
/**
 * All regular filter operators
 *
 * TODO would love to filter this based on field type but thats not accurate enough in the schema atm
 */
type FilterOperators<T> = {
    _eq?: T;
    _neq?: T;
    _gt?: T;
    _gte?: T;
    _lt?: T;
    _lte?: T;
    _in?: T[];
    _nin?: T[];
    _between?: [T, T];
    _nbetween?: [T, T];
    _contains?: T;
    _ncontains?: T;
    _starts_with?: T;
    _istarts_with?: T;
    _nstarts_with?: T;
    _nistarts_with?: T;
    _ends_with?: T;
    _iends_with?: T;
    _nends_with?: T;
    _niends_with?: T;
    _empty?: boolean;
    _nempty?: boolean;
    _nnull?: boolean;
    _null?: boolean;
    _intersects?: T;
    _nintersects?: T;
    _intersects_bbox?: T;
    _nintersects_bbox?: T;
    _regex?: T;
};
/**
 * Relational filter operators
 */
type RelationalFilterOperators = '_some' | '_none';
type WrapRelationalFilters<Filters> = {
    [Operator in RelationalFilterOperators]?: Filters;
} | Filters;
/**
 * Logical filter operations
 */
type LogicalFilterOperators = '_or' | '_and';
type WrapLogicalFilters<Filters> = {
    [Operator in LogicalFilterOperators]?: WrapLogicalFilters<Filters>[];
} | Filters;

/**
 * All query options available
 */
interface Query<Schema extends object, Item> {
    readonly fields?: IfAny<Schema, (string | Record<string, any>)[], QueryFields<Schema, Item>> | undefined;
    readonly filter?: IfAny<Schema, Record<string, any>, QueryFilter<Schema, Item>> | undefined;
    readonly search?: string | undefined;
    readonly sort?: IfAny<Schema, string | string[], QuerySort<Schema, Item> | QuerySort<Schema, Item>[]> | undefined;
    readonly limit?: number | undefined;
    readonly offset?: number | undefined;
    readonly page?: number | undefined;
    readonly deep?: IfAny<Schema, Record<string, any>, QueryDeep<Schema, Item>> | undefined;
    readonly alias?: IfAny<Schema, Record<string, string>, QueryAlias<Schema, Item>> | undefined;
}
/**
 * Returns Item types that are available in the root Schema
 */
type ExtractItem<Schema extends object, Item> = Extract<UnpackList<Item>, ItemType<Schema>>;
/**
 * Returns the relation type from the current item by key
 */
type ExtractRelation<Schema extends object, Item extends object, Key> = Key extends keyof Item ? ExtractItem<Schema, Item[Key]> : never;
/**
 * Merge union of optional objects
 */
type MergeRelationalFields<FieldList> = Exclude<UnpackList<FieldList>, string> extends infer RelatedFields ? {
    [Key in RelatedFields extends any ? keyof RelatedFields : never]-?: Exclude<RelatedFields[Key], undefined>;
} : never;
/**
 * Merge separate relational objects together
 */
type MergeFields<FieldList> = HasNestedFields<FieldList> extends never ? Extract<UnpackList<FieldList>, string> : Extract<UnpackList<FieldList>, string> | MergeRelationalFields<FieldList>;
/**
 * Query sort
 * TODO expand to relational sorting (same object notation as fields i guess)
 */
type QuerySort<_Schema extends object, Item> = UnpackList<Item> extends infer FlatItem ? {
    [Field in keyof FlatItem]: Field | `-${Field & string}`;
}[keyof FlatItem] : never;
type MergeObjects<A, B extends object> = A extends object ? A & B : never;
/**
 * Alias object
 *
 * TODO somehow include these aliases in the Field Types!!
 */
type QueryAlias<_Schema extends object, Item> = Record<string, keyof Item>;

type WebSocketAuthModes = 'public' | 'handshake' | 'strict';
interface WebSocketConfig {
    authMode?: WebSocketAuthModes;
    reconnect?: {
        delay: number;
        retries: number;
    } | false;
    heartbeat?: boolean;
    url?: string;
}
interface SubscribeOptions<Schema extends object, Collection extends keyof Schema> {
    event?: SubscriptionOptionsEvents;
    query?: Query<Schema, Schema[Collection]>;
    uid?: string;
}
type WebSocketEvents = 'open' | 'close' | 'error' | 'message';
type RemoveEventHandler = () => void;
type WebSocketEventHandler = (this: WebSocket, ev: Event | CloseEvent | any) => any;
interface WebSocketClient<Schema extends object> {
    connect(): Promise<void>;
    disconnect(): void;
    onWebSocket(event: 'open', callback: (this: WebSocket, ev: Event) => any): RemoveEventHandler;
    onWebSocket(event: 'error', callback: (this: WebSocket, ev: Event) => any): RemoveEventHandler;
    onWebSocket(event: 'close', callback: (this: WebSocket, ev: CloseEvent) => any): RemoveEventHandler;
    onWebSocket(event: 'message', callback: (this: WebSocket, ev: any) => any): RemoveEventHandler;
    onWebSocket(event: WebSocketEvents, callback: WebSocketEventHandler): RemoveEventHandler;
    sendMessage(message: string | Record<string, any>): void;
    subscribe<Collection extends keyof Schema, Options extends SubscribeOptions<Schema, Collection>>(collection: Collection, options?: Options): Promise<{
        subscription: AsyncGenerator<SubscriptionOutput<Schema, Collection, Options['query'], Fallback<Options['event'], SubscriptionOptionsEvents> | 'init'>, void, unknown>;
        unsubscribe(): void;
    }>;
}
type Fallback<Selected, Options> = Selected extends Options ? Selected : Options;
type SubscriptionOptionsEvents = 'create' | 'update' | 'delete';
type SubscriptionEvents = 'init' | SubscriptionOptionsEvents;
type SubscriptionOutput<Schema extends object, Collection extends keyof Schema, TQuery extends Query<Schema, Schema[Collection]> | undefined, Events extends SubscriptionEvents, TItem = TQuery extends Query<Schema, Schema[Collection]> ? ApplyQueryFields<Schema, CollectionType<Schema, Collection>, TQuery['fields']> : Partial<Schema[Collection]>> = {
    type: 'subscription';
} & {
    [Event in Events]: SubscriptionPayload<TItem>[Event];
}[Events];
type SubscriptionPayload<Item> = {
    init: Item[];
    create: Item[];
    update: Item[];
    delete: string[] | number[];
};

/**
 * Apply the configured fields query parameter on a given Item type
 */
type ApplyQueryFields<Schema extends object, Collection extends object, ReadonlyFields, CollectionItem extends object = UnpackList<Collection>, Fields = UnpackList<Mutable<ReadonlyFields>>, RelationalFields = PickRelationalFields<Fields>, RelationalKeys = RelationalFields extends never ? never : keyof RelationalFields, FlatFields = FieldsWildcard<CollectionItem, Exclude<Fields, RelationalKeys>>> = IfAny<Schema, Record<string, any>, Merge<PickFlatFields<Schema, CollectionItem, FlatFields>, RelationalFields extends never ? never : {
    [Field in keyof RelationalFields]: Field extends keyof CollectionItem ? Extract<CollectionItem[Field], ItemType<Schema>> extends infer RelatedCollection ? RelationNullable<CollectionItem[Field], RelatedCollection extends any[] ? HasManyToAnyRelation<RelatedCollection> extends never ? ApplyNestedQueryFields<Schema, RelatedCollection, RelationalFields[Field]>[] | null : ApplyManyToAnyFields<Schema, RelatedCollection, RelationalFields[Field]>[] : ApplyNestedQueryFields<Schema, RelatedCollection, RelationalFields[Field]>> : never : never;
}>>;
/**
 * Apply the configured fields query parameter on a many to any relation
 */
type ApplyManyToAnyFields<Schema extends object, JunctionCollection, FieldsList, Junction = UnpackList<JunctionCollection>> = Junction extends object ? PickRelationalFields<FieldsList> extends never ? ApplyQueryFields<Schema, Junction, Readonly<UnpackList<FieldsList>>> : 'item' extends keyof PickRelationalFields<FieldsList> ? PickRelationalFields<FieldsList>['item'] extends infer ItemFields ? Omit<ApplyQueryFields<Schema, Omit<Junction, 'item'>, Readonly<UnpackList<FieldsList>>>, 'item'> & {
    item: {
        [Scope in keyof ItemFields]: Scope extends keyof Schema ? ApplyNestedQueryFields<Schema, Schema[Scope], ItemFields[Scope]> : never;
    }[keyof ItemFields];
} : never : ApplyQueryFields<Schema, Junction, Readonly<UnpackList<FieldsList>>> : never;
/**
 * wrapper to aid in recursion
 */
type ApplyNestedQueryFields<Schema extends object, Collection, Fields> = Collection extends object ? ApplyQueryFields<Schema, Collection, Readonly<UnpackList<Fields>>> : never;
/**
 * Carry nullability of
 */
type RelationNullable<Relation, Output> = IsNullable<Relation, Output | null, Output>;

export { ApplyQueryFields as $, DirectusShare as A, DirectusUser as B, CollectionMetaTranslationType as C, DirectusActivity as D, DirectusWebhook as E, FieldMetaConditionType as F, QueryFields as G, WrapQueryFields as H, QueryFieldsRelational as I, HasManyToAnyRelation as J, HasNestedFields as K, FieldsWildcard as L, ManyToAnyFields as M, RelationalQueryFields as N, PickFlatFields as O, PickRelationalFields as P, QueryDeep as Q, RemoveEventHandler as R, SubscribeOptions as S, QueryFilter as T, NestedQueryFilter as U, FilterOperators as V, WebSocketAuthModes as W, RelationalFilterOperators as X, WrapRelationalFilters as Y, LogicalFilterOperators as Z, WrapLogicalFilters as _, WebSocketConfig as a, ApplyManyToAnyFields as a0, ApplyNestedQueryFields as a1, RelationNullable as a2, Query as a3, ExtractItem as a4, ExtractRelation as a5, MergeRelationalFields as a6, MergeFields as a7, QuerySort as a8, MergeObjects as a9, QueryAlias as aa, ItemType as ab, CollectionType as ac, SingletonCollections as ad, RegularCollections as ae, PrimitiveFields as af, RelationalFields as ag, RemoveRelationships as ah, MergeCoreCollection as ai, CompleteSchema as aj, AllCollections as ak, GetCollection as al, GetCollectionName as am, Mutable as an, UnpackList as ao, Merge as ap, NeverToUnknown as aq, IfAny as ar, IsAny as as, IsNullable as at, NestedPartial as au, WebSocketEvents as b, WebSocketEventHandler as c, WebSocketClient as d, SubscriptionOptionsEvents as e, SubscriptionEvents as f, SubscriptionOutput as g, SubscriptionPayload as h, DirectusCollection as i, CoreSchema as j, DirectusDashboard as k, DirectusField as l, FieldMetaConditionOptionType as m, FieldMetaTranslationType as n, DirectusFile as o, DirectusFlow as p, DirectusFolder as q, DirectusNotification as r, DirectusOperation as s, DirectusPanel as t, DirectusPermission as u, DirectusPreset as v, DirectusRelation as w, DirectusRevision as x, DirectusRole as y, DirectusSettings as z };
