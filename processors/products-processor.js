const { get, post, count, empty, getSync, groupBy } = require('./mongo-client-processor');
const moment = require('moment');
const { ObjectID } = require('mongodb');
const _ = require('lodash');
const { weightType, weightCalc } = require('../utils/formatter');
const { downloadProducts, storage } = require('../constants/defaults');
const { configuration } = require('./configuration-processor');
const products = async () => {
    const productList = await get('AMZ-SCRAPPED-DATA');
    return productList;
}

const product = async (filter, proj = {}, sort = {}, limit) => {
    const existingProduct = await get('AMZ-SCRAPPED-DATA', filter, proj, sort, limit);
    return existingProduct;
}

const localeProducts = async (filter = {}) => {
    const prods = await get('PRODUCTS', filter);
    return prods;
}
const processedProducts = async (req) => {
    const { pageNo, category, subCategory, subCategory1, subCategory2, subCategory3, asin, sku, limit } = req.query;
    let filters = { category, subCategory, subCategory1, subCategory2, subCategory3 };
    if (asin) {
        const regexASIN = new RegExp(asin, 'i');
        filters.asin = { $regex: regexASIN };
    }
    if (sku) {
        const regexSKU = new RegExp(sku, 'i');
        filters.sku = { $regex: regexSKU };
    }
    filters = _.pickBy(filters, (v) => v);
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
    const { proxies } = await configuration('CONFIGURATION');
    const hosts = proxies.split(',');
    const merged = productList.map(async p => {
        const price = await get('PRICE', { asin: p.asin });
        return _.merge(p, price[0]);
    });
    return Promise.all(merged).then(d => {
        const convert = d.map(i => {
            const jobId = i.jobId;
            const job = await get('JOBS', { scheduleId: jobId });
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
                    // To do - to handle dynamically
                    let host = hosts[0];
                    if (job.address === "172.26.2.171") {
                        host = hosts[0];
                    } else if (hosts.length > 1 && job.address === "172.26.0.214") {
                        host = hosts[1];
                    }
                    // To do - to handle dynamically
                    mapped[`img${imIndex + 1}`] = `${host}:${storage.scrapPort}/amazon/images/${i.asin}/${image}`;
                })

            }
            if (categoryCode) {
                mapped['Kategori Kode*'] = categoryCode;
            }
            mapped['Minimum Pemesanan *'] = '1';
            mapped['Nomor Etalase'] = storeId;
            mapped['Waktu Proses Preorder'] = '';
            mapped['Kondisi*'] = 'New';
            mapped['SKU Name'] = `${i.sku}`;
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
    const isExists = await product({ asin: data.asin });
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

const grouByAMZN = async () => {
    const group = {
        _id: {
            category: "$category",
            subCategory: "$subCategory",
            subCategory1: "$subCategory1",
            subCategory2: "$subCategory2",
            subCategory3: "$subCategory3"
        }, count: { $sum: 1 }
    }
    const g = await groupBy('AMZ-SCRAPPED-DATA', { localed: false }, group);
    return g;

}

module.exports = { products, product, addProduct, processedProducts, processedProduct, downloadProcessedProducts, localeProducts, grouByAMZN };