const { get, post } = require('./mongo-client-processor');
const jobs = async () => {
    const categoryList = await get('JOBS');
    return categoryList;
}
const addJob = async (data) => {
    const categoryInsert = await post('JOBS', {insertMode: 'insertOne'}, data);
    return categoryInsert;
}

module.exports = { jobs, addJob };