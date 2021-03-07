const { get, post, count, empty, getSync } = require('./mongo-client-processor');
const moment = require('moment');
const { ObjectID } = require('mongodb');
const _ = require('lodash');
const products = async () => {
    const productList = await get('AMZ-SCRAPPED-DATA');
    return productList;
}

const product = async (asin) => {
    const existingProduct = await get('AMZ-SCRAPPED-DATA', { asin });
    return existingProduct;
}
const processedProducts = async (req) => {
    const { pageNo, category, subCategory, limit } = req.query;
    const filters = { category, subCategory };
    const length = await count('PRODUCTS', filters);
    const productList = await getSync('PRODUCTS', filters, {}, pageNo, limit);
    const merged = productList.map(async p => {
        const price = await get('PRICE', { asin: p.asin });
        return _.merge(p, price[0]);
    });
    return Promise.all(merged).then(d => {
        return { products: d, total: length };
    });
}
const downloadProcessedProducts = async (req) => {
    const { pageNo, category, subCategory, limit } = req.query;
    const filters = { category, subCategory };
    const length = await count('PRODUCTS', filters);
    const productList = await get('PRODUCTS', filters);
    const merged = productList.map(async p => {
        const price = await get('PRICE', { asin: p.asin });
        return _.merge(p, price[0]);
    });
    return Promise.all(merged).then(d => d);
}

const processedProduct = async (asin) => {
    const existingProduct = await get('PRODUCTS', { asin });
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

module.exports = { products, addProduct, processedProducts, processedProduct, downloadProcessedProducts };