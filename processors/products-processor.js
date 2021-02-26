const { get, post } = require('./mongo-client-processor');
const categories = async () => {
    const categoryList = await get('CATEGORIES');
    return categoryList;
}
const addCategory = async (data) => {
    const categoryInsert = await post('CATEGORIES', {insertMode: 'insertOne'}, data);
    return categoryInsert;
}

module.exports = { categories, addCategory };