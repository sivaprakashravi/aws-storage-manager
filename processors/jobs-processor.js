const { get, post, update, inactivate, empty } = require('./mongo-client-processor');
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');
const jobs = async (filter = {}) => {
    // filter.active = true;
    const categoryList = await get('JOBS', filter);
    return categoryList;
}

const job = async (id) => {
    if (id) {
        const singleJob = await get('JOBS', { _id: ObjectID(id) });
        return singleJob;
    }
}

const stopJob = async (req) => {
    let { id, scheduleId } = req.params;
    scheduleId = Number(scheduleId);
    const activeJob = await job(id);
    if (activeJob && activeJob[0].active) {
        const jobStopped = await inactivate('JOBS', { _id: ObjectID(id), scheduleId });
        return jobStopped;
    }
    return true;
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

const deleteJob = async (scheduleId) => {
    const sJob = await jobs({ scheduleId });
    if (sJob && sJob.length && (sJob[0].status === 'New' || sJob[0].status === 'Error') && sJob[0].scheduleId === scheduleId) {
        const removed = await empty('JOBS', { scheduleId });
        return removed;
    } else {
        return false;
    }
}

const pauseJob = async (id, scheduleId, paused) => {
    const updated = await update('JOBS', {
        _id: ObjectID(id),
        scheduleId
    }, {
        paused
    });
    return updated;
}

const recursiveJob = async (id, scheduleId, recursive) => {
    const updated = await update('JOBS', {
        _id: ObjectID(id),
        scheduleId
    }, {
        recursive
    });
    return updated;
}

const primeJob = async (id, scheduleId, prime) => {
    const updated = await update('JOBS', {
        _id: ObjectID(id),
        scheduleId
    }, {
        prime
    });
    return updated;
}

const updateJobStatus = async (id, scheduleId, percentage, status, address, message) => {
    const activeJob = await job(id);
    percentage = percentage ? Number(percentage).toFixed(2) : 0;
    scheduleId = Number(scheduleId);
    status = (percentage && percentage >= 100) ? 'Completed' : status;
    const categoryInsert = await update('JOBS', {
        _id: ObjectID(id),
        scheduleId
    }, {
        percentage,
        address,
        message,
        status: percentage > 0 ? ((percentage >= 100) ? 'Completed' : 'Running') : status,
        active: percentage > 0 && (percentage >= 100) && !activeJob[0].interval ? false : true
    });
    return categoryInsert;
}

module.exports = { jobs, addJob, updateJobStatus, stopJob, deleteJob, pauseJob, recursiveJob, primeJob };