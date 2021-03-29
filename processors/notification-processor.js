const { get, post, count, getSync } = require('./mongo-client-processor');
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');
const notifications = async (body) => {
    const filters = { active: true };
    const { pageNo, limit } = body;
    const length = await count('NOTIFICATIONS', filters);
    const allNotifications = await getSync('NOTIFICATIONS', filters, {}, pageNo, limit);
    return { notifications: allNotifications, total: length };
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

module.exports = { notification, notificationsCount, notifications, addNotification };