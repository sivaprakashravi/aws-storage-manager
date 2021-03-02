const { get, post, update } = require('./mongo-client-processor');
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');
const jobs = async () => {
    const categoryList = await get('JOBS');
    return categoryList;
}

const job = async (id) => {
    if (id) {
        const singleJob = await get('JOBS', { _id: ObjectID(id) });
        return singleJob;
    }
}

const addJob = async (data) => {
    data.active = true;
    data.statue = 'New';
    data.createdOn = moment().format();
    const categoryInsert = await post('JOBS', { insertMode: 'insertOne' }, data);
    return categoryInsert;
}

const updateJobStatus = async (id, scheduleId, percentage, status) => {
    const activeJob = await job(id);
    percentage = Number(percentage).toFixed();
    scheduleId = Number(scheduleId);
    status = (percentage && percentage >= 100) ? 'Completed' : status;
    const categoryInsert = await update('JOBS', {
        _id: ObjectID(id),
        scheduleId
    }, {
        percentage,
        status: percentage > 0 ? (percentage >= 100) ? 'Completed' : 'Running' : 'New',
        active: percentage > 0 && (percentage >= 100) && !activeJob.interval ? false : true
    });
    return categoryInsert;
}

module.exports = { jobs, addJob, updateJobStatus };