const { get, post, empty } = require('./mongo-client-processor');
const moment = require('moment');
const { ObjectID } = require('mongodb');
const products = async () => {
    const productList = await get('AMZ-SCRAPPED-DATA');
    return productList;
}

const product = async (asin) => {
    const existingProduct = await get('AMZ-SCRAPPED-DATA', { asin });
    return existingProduct;
}

const addProduct = async (data) => {
    const isExists = await product(data.asin);
    if (isExists && isExists.length) {
        await empty('AMZ-SCRAPPED-DATA', { asin: data.asin });
        data.history = isExists[0].history ? isExists[0].history : [];
        data.history.push(moment().format());
    }
    // const productInsert = await post('PRODUCTS', { insertMode: 'insertOne' }, data);
    const addtoAmazon = await addScrapAmz(data);
    return addtoAmazon;
}

const addScrapAmz = async (data) => {
    const scrap = await post('AMZ-SCRAPPED-DATA', { insertMode: 'insertOne' }, data);
    return scrap;
}

module.exports = { products, addProduct };