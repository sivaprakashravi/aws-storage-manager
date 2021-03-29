const { get, post, count, empty, getSync } = require('./mongo-client-processor');
const moment = require('moment');
const { ObjectID } = require('mongodb');
const _ = require('lodash');
const { weightType, weightCalc } = require('../utils/formatter');
const { downloadProducts, storage } = require('../constants/defaults');
const products = async () => {
    const productList = await get('AMZ-SCRAPPED-DATA');
    return productList;
}

const product = async (filter) => {
    const existingProduct = await get('AMZ-SCRAPPED-DATA', filter);
    return existingProduct;
}

const localeProducts = async (filter = {}) => {
    const prods = await get('PRODUCTS', filter);
    return prods;
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
    const { pageNo, category, subCategory, storeId, categoryCode, limit } = req.query;
    const filters = { category, subCategory };
    const length = await count('PRODUCTS', filters);
    const productList = await get('PRODUCTS', filters);
    const merged = productList.map(async p => {
        const price = await get('PRICE', { asin: p.asin });
        return _.merge(p, price[0]);
    });
    return Promise.all(merged).then(d => {
        const convert = d.map(i => {
            if (i.item_dimensions_weight) {
                const wCalc = weightType(i.item_dimensions_weight);
                i.item_dimensions_weight = (weightCalc(wCalc) * 1000).toString();
            } else {
                i.item_dimensions_weight = '0';
            }
            const mapped = {};
            for (const key in downloadProducts) {
                mapped[downloadProducts[key]] = (i[key]);
            }
            if (i.altImages) {
                i.altImages.forEach((image, imIndex) => {
                    mapped[`img${imIndex + 1}`] = `http://localhost:${storage.scrapPort}/amazon/images/${i.asin}/${image}`;
                })

            }
            if(categoryCode) {
                mapped['Kategori Kode*'] = categoryCode;
            }
            mapped['Minimum Pemesanan *'] = '1';
            mapped['Nomor Etalase'] = storeId;
            mapped['Waktu Proses Preorder'] = '';
            mapped['Kondisi*'] = 'New';
            mapped['SKU Name'] = '';
            mapped['Status*'] = 'Active';
            mapped['Jumlah Stok*'] = 'New';
            mapped['Asuransi Pengiriman'] = 'Yes';
            return mapped;
        });
        return convert;
    });
}

const processedProduct = async (asin) => {
    const existingProduct = await get('PRODUCTS', { asin });
    return existingProduct;
}

const addProduct = async (data) => {
    const isExists = await product({asin: data.asin});
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

module.exports = { products, product, addProduct, processedProducts, processedProduct, downloadProcessedProducts, localeProducts };