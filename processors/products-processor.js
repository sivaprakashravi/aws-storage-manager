const { get, post, empty } = require('./mongo-client-processor');
const moment = require('moment');
const products = async () => {
    const productList = await get('PRODUCTS');
    return productList;
}

const product = async (asin) => {
    const existingProduct = await get('PRODUCTS', { asin });
    return existingProduct;
}

const addProduct = async (data) => {
    const isExists = await product(data.asin);
    if (isExists) {
        await empty('PRODUCTS', { asin: data.asin });
        data.history = isExists.history ? isExists.history : [];
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