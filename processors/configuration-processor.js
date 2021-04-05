const { get, post, empty, inactivate } = require('./mongo-client-processor');
const configuration = async (name) => {
    let config = await get(name);
    config = config && config.length ? config[0] : {};
    return config;
}
const setConfiguration = async (name, data) => {
    const config = await post(name, { insertMode: 'insertOne' }, data);
    return config;
}

const inactivateConfiguration = async (name) => {
    const emptied = await empty(name);
    return emptied;
}

module.exports = { configuration, setConfiguration, inactivateConfiguration };