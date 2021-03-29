const { get, post, update, empty } = require('./mongo-client-processor');
const moment = require('moment');
const { ObjectID } = require('bson');
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
const newCategory = async (data) => {
    if(data && data.name && data.nId) {
        delete data._id;
        const cat = await category(data.nId);
        if(cat && !cat.length) {
            data.treeIndex = 0;
            data.createdDate = moment().format();
            data.createdBy = 'USER';
            await post('CATEGORIES', { insertMode: 'insertOne' }, data);
            const freshCategories = await categories();
            return freshCategories;
        } else {
            return {message: 'Category already defined'};
        }
    }
}

const emptyAllCategory = async () => {
    const emptied = await empty('CATEGORIES');
    return emptied;
}

const updateCategory = async({name, nId, _id, subCategory}) => {
    let filter = {
        _id: ObjectID(_id)
    };
    let values = {
        name, nId, subCategory
    }
    const cat = await category(nId);
    await empty('CATEGORIES', {nId: cat[0].nId});
    const updated = await newCategory(values);
    return updated;

}

const updateStoreInfo = async (category, subCategory, subCategory1, storeId) => {
    let filter = {
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
    if (subCategory1) {
        filter['subCategory.subCategory.nId'] = subCategory1;
        const cat = await get('CATEGORIES', filter);
        const index = cat[0].subCategory.findIndex(f => f.nId === subCategory);   
        const sc = cat[0].subCategory.find(f => f.nId === subCategory);    
        const scsIndex = sc.subCategory.findIndex(sf => sf.nId === subCategory1);   
        values = {
            [`subCategory.${index}.subCategory.${scsIndex}.storeId`]: storeId
        }
    }
    const emptied = await update('CATEGORIES', filter, values);
    return emptied;

}

module.exports = { categories, addCategory, newCategory, updateStoreInfo, updateCategory, emptyAllCategory };