const { get, post, empty, inactivate } = require('./mongo-client-processor');
const configuration = async () => {
    const categoryList = await get('CONFIGURATION');
    return categoryList;
}
const setConfiguration = async (data) => {
    data.active = true;
    const config = await post('CONFIGURATION', {insertMode: 'insertOne'}, data);
    return config;
}

const inactivateConfiguration = async () => {
    const emptied = await empty('CONFIGURATION');
    return emptied;
}

module.exports = { configuration, setConfiguration, inactivateConfiguration };