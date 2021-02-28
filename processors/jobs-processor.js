const { get, post, update } = require('./mongo-client-processor');
const jobs = async () => {
    const categoryList = await get('JOBS');
    return categoryList;
}
const addJob = async (data) => {
    const categoryInsert = await post('JOBS', { insertMode: 'insertOne' }, data);
    return categoryInsert;
}

const updateJobStatus = async (id, scheduleId, percentage) => {
    const categoryInsert = await update('JOBS', { _id: id, scheduleId }, { percentage });
    return categoryInsert;
}

module.exports = { jobs, addJob, updateJobStatus };