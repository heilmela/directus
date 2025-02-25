import { ForbiddenError, UnprocessableContentError } from '../errors/index.js';
import { ItemsService } from './items.js';
import { PermissionsService } from './permissions.js';
import { PresetsService } from './presets.js';
import { UsersService } from './users.js';
export class RolesService extends ItemsService {
    constructor(options) {
        super('directus_roles', options);
    }
    async checkForOtherAdminRoles(excludeKeys) {
        // Make sure there's at least one admin role left after this deletion is done
        const otherAdminRoles = await this.knex
            .count('*', { as: 'count' })
            .from('directus_roles')
            .whereNotIn('id', excludeKeys)
            .andWhere({ admin_access: true })
            .first();
        const otherAdminRolesCount = +(otherAdminRoles?.count || 0);
        if (otherAdminRolesCount === 0) {
            throw new UnprocessableContentError({ reason: `You can't delete the last admin role` });
        }
    }
    async checkForOtherAdminUsers(key, users) {
        const role = await this.knex.select('admin_access').from('directus_roles').where('id', '=', key).first();
        if (!role)
            throw new ForbiddenError();
        // The users that will now be in this new non-admin role
        let userKeys = [];
        if (Array.isArray(users)) {
            userKeys = users.map((user) => (typeof user === 'string' ? user : user['id'])).filter((id) => id);
        }
        else {
            userKeys = users.update.map((user) => user['id']).filter((id) => id);
        }
        const usersThatWereInRoleBefore = (await this.knex.select('id').from('directus_users').where('role', '=', key)).map((user) => user.id);
        const usersThatAreRemoved = usersThatWereInRoleBefore.filter((id) => Array.isArray(users) ? userKeys.includes(id) === false : users.delete.includes(id) === true);
        const usersThatAreAdded = Array.isArray(users) ? users : users.create;
        // If the role the users are moved to is an admin-role, and there's at least 1 (new) admin
        // user, we don't have to check for other admin
        // users
        if ((role.admin_access === true || role.admin_access === 1) && usersThatAreAdded.length > 0)
            return;
        const otherAdminUsers = await this.knex
            .count('*', { as: 'count' })
            .from('directus_users')
            .whereNotIn('directus_users.id', [...userKeys, ...usersThatAreRemoved])
            .andWhere({ 'directus_roles.admin_access': true })
            .leftJoin('directus_roles', 'directus_users.role', 'directus_roles.id')
            .first();
        const otherAdminUsersCount = +(otherAdminUsers?.count || 0);
        if (otherAdminUsersCount === 0) {
            throw new UnprocessableContentError({ reason: `You can't remove the last admin user from the admin role` });
        }
        return;
    }
    async updateOne(key, data, opts) {
        try {
            if ('users' in data) {
                await this.checkForOtherAdminUsers(key, data['users']);
            }
        }
        catch (err) {
            (opts || (opts = {})).preMutationError = err;
        }
        return super.updateOne(key, data, opts);
    }
    async updateBatch(data, opts) {
        const primaryKeyField = this.schema.collections[this.collection].primary;
        const keys = data.map((item) => item[primaryKeyField]);
        const setsToNoAdmin = data.some((item) => item['admin_access'] === false);
        try {
            if (setsToNoAdmin) {
                await this.checkForOtherAdminRoles(keys);
            }
        }
        catch (err) {
            (opts || (opts = {})).preMutationError = err;
        }
        return super.updateBatch(data, opts);
    }
    async updateMany(keys, data, opts) {
        try {
            if ('admin_access' in data && data['admin_access'] === false) {
                await this.checkForOtherAdminRoles(keys);
            }
        }
        catch (err) {
            (opts || (opts = {})).preMutationError = err;
        }
        return super.updateMany(keys, data, opts);
    }
    async deleteOne(key) {
        await this.deleteMany([key]);
        return key;
    }
    async deleteMany(keys) {
        const opts = {};
        try {
            await this.checkForOtherAdminRoles(keys);
        }
        catch (err) {
            opts.preMutationError = err;
        }
        await this.knex.transaction(async (trx) => {
            const itemsService = new ItemsService('directus_roles', {
                knex: trx,
                accountability: this.accountability,
                schema: this.schema,
            });
            const permissionsService = new PermissionsService({
                knex: trx,
                accountability: this.accountability,
                schema: this.schema,
            });
            const presetsService = new PresetsService({
                knex: trx,
                accountability: this.accountability,
                schema: this.schema,
            });
            const usersService = new UsersService({
                knex: trx,
                accountability: this.accountability,
                schema: this.schema,
            });
            // Delete permissions/presets for this role, suspend all remaining users in role
            await permissionsService.deleteByQuery({
                filter: { role: { _in: keys } },
            }, { ...opts, bypassLimits: true });
            await presetsService.deleteByQuery({
                filter: { role: { _in: keys } },
            }, { ...opts, bypassLimits: true });
            await usersService.updateByQuery({
                filter: { role: { _in: keys } },
            }, {
                status: 'suspended',
                role: null,
            }, { ...opts, bypassLimits: true });
            await itemsService.deleteMany(keys, opts);
        });
        return keys;
    }
    deleteByQuery(query, opts) {
        return super.deleteByQuery(query, opts);
    }
}
