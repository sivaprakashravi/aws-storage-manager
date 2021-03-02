const { get, post, empty } = require('./mongo-client-processor');
const categories = async () => {
    const categoryList = await get('CATEGORIES');
    return categoryList;
}
const addCategory = async (data) => {
    await post('CATEGORIES', { insertMode: 'insertMany' }, data);
    const freshCategories = await categories();
    return freshCategories;
}

const emptyAllCategory = async () => {
    const emptied = await empty('CATEGORIES');
    return emptied;
}

module.exports = { categories, addCategory, emptyAllCategory };