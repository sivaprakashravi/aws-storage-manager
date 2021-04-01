const { get, post, update, count, getSync } = require('./mongo-client-processor');
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');
const _ = require('lodash');
const { priceUpdate, locale } = require('./locale-processor');
const notifications = async (body) => {
    const filters = { active: true };
    const { pageNo, limit } = body;
    const length = await count('NOTIFICATIONS', filters);
    const allNotifications = await getSync('NOTIFICATIONS', filters, {}, pageNo, limit);
    const asins = allNotifications.map(({ asin }) => {
        return { asin };
    });
    const getProds = await get('PRODUCTS', { $or: asins });
    const products = getProds.map(({ sku, asin }) => {
        return { sku, asin };
    });
    const merged = _.merge(allNotifications, products);
    return { notifications: merged, total: length };
}

const updateAllNotifications = async () => {
    const filter = { active: true };
    const values = { filter: false };
    const notifications = await get('NOTIFICATIONS');
    notifications.forEach(async (n) => {
        const localeApplied = await locale({asin: n.asin, active: true});
        await update('PRICE', { asin: n.asin }, {active: false});
        const newPrice = await priceUpdate(n, localeApplied[0]);
        const newUpdate = await post('PRICE', { insertMode: 'insertOne' }, newPrice);
        return newUpdate;
    })
    const emptied = await update('NOTIFICATIONS', filter, values);
}

const notificationsCount = async () => {
    const filters = { active: true };
    const length = await count('NOTIFICATIONS', filters);
    return length;
}

const notification = async (id) => {
    if (id) {
        const singleJob = await get('NOTIFICATIONS', { _id: ObjectID(id) });
        return singleJob;
    }
}

const addNotification = async (data) => {
    data.active = true;
    data.createdBy = 'DEVELOPER';
    data.createdOn = moment().format();
    const newJob = await post('NOTIFICATIONS', { insertMode: 'insertOne' }, data);
    return newJob;
}

module.exports = { notification, notificationsCount, notifications, addNotification, updateAllNotifications };