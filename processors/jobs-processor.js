const { get, post, update } = require('./mongo-client-processor');
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');
const jobs = async ({query}) => {
    const filter = query;
    const categoryList = await get('JOBS', filter);
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
    data.status = 'New';
    data.scheduleId = new Date().getTime();
    data.scheduledBy = 'DEVELOPER';
    data.createdOn = moment().format();
    const newJob = await post('JOBS', { insertMode: 'insertOne' }, data);
    return newJob;
}

const updateJobStatus = async (id, scheduleId, percentage, status) => {
    const activeJob = await job(id);
    console.log(percentage);
    percentage = percentage ? Number(percentage).toFixed() : 0;
    scheduleId = Number(scheduleId);
    status = (percentage && percentage >= 100) ? 'Completed' : status;
    const categoryInsert = await update('JOBS', {
        _id: ObjectID(id),
        scheduleId
    }, {
        percentage,
        status: percentage > 0 ? ((percentage >= 100) ? 'Completed' : 'Running') : 'New',
        active: percentage > 0 && (percentage >= 100) && !activeJob.interval ? false : true
    });
    return categoryInsert;
}

module.exports = { jobs, addJob, updateJobStatus };