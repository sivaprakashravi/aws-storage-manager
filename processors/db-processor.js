const { count, empty } = require('./mongo-client-processor');
const dataList = async (collectionName) => {
    // filter.active = true;
    const list = await count(collectionName);
    return list;
}

const emptyDB = async (collectionName) => {
    if (collectionName) {
        const hasCount = await dataList(collectionName);
        if(hasCount) {
            const db = await empty(collectionName);
            return db;
        }
    }
}

module.exports = { emptyDB };