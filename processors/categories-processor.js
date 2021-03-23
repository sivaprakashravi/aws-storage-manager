const { get, post, update, empty } = require('./mongo-client-processor');
const categories = async () => {
    const categoryList = await get('CATEGORIES');
    return categoryList;
}
const category = async (categoryId) => {
    const categoryList = await get('CATEGORIES', { nId: categoryId });
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

const updateCategory = async (category, subCategory, storeId) => {
    const filter = {
        nId: category
    };
    let values = {
        storeId
    }
    if (subCategory) {
        filter['subCategory.nId'] = subCategory;
        values = {
            "subCategory.$.storeId": storeId
        }
    }
    const emptied = await update('CATEGORIES', filter, values);
    return emptied;

}

module.exports = { categories, addCategory, updateCategory, emptyAllCategory };