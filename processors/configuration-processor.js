const { get, post, empty, inactivate } = require('./mongo-client-processor');
const configuration = async () => {
    let config = await get('CONFIGURATION');
    config = config && config.length ? config[0] : {};
    return config;
}
const setConfiguration = async (data) => {
    const config = await post('CONFIGURATION', {insertMode: 'insertOne'}, data);
    return config;
}

const inactivateConfiguration = async () => {
    const emptied = await empty('CONFIGURATION');
    return emptied;
}

module.exports = { configuration, setConfiguration, inactivateConfiguration };