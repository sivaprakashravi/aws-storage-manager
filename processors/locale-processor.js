const { get, count, post, update, inactivate, empty } = require('./mongo-client-processor');
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');
const _ = require('lodash');
const locales = async () => {
    const filter = {};
    filter.active = true;
    const categoryList = await get('LOCALE', filter);
    return categoryList;
}

const locale = async (filters) => {
    if (filters) {
        const singleJob = await get('LOCALE', filters);
        return singleJob;
    }
}

const addLocale = async (data) => {
    data.localeId = new Date().getTime();
    data.active = true;
    data.createdBy = 'DEVELOPER';
    data.createdOn = moment().format();
    data.dealerCharge = Number(data.dealerCharge);
    data.deliveryCharge = Number(data.deliveryCharge);
    const newJob = await post('LOCALE', { insertMode: 'insertOne' }, data);
    return newJob;
}

const deleteLocale = async (localeId) => {
    if (localeId) {
        const singleJob = await inactivate('LOCALE', { localeId });
        return singleJob;
    }
}

const updateProducts = async ({ body }) => {
    if (!body.noSave) {
        await addLocaleLog(body);
    } else {
        await update('LOCALE-LOGS', { log: body.log }, { status: 'applied' });

    }
    let { category, subCategory } = body;
    const localeObj = await locale(body.locale);
    const { dealerCharge, deliveryCharge, dealerChargeType, deliveryChargeType } = localeObj[0];
    const filter = { category, subCategory };
    const amznProducts = await get('AMZ-SCRAPPED-DATA', filter);
    let count = 0;
    if (amznProducts && amznProducts.length) {
        const asin = amznProducts.map(a => a.asin);
        const priceList = amznProducts.map(({ buybox_new_listing_price, asin }) => {
            buybox_new_listing_price = Number(buybox_new_listing_price);
            const dealCharge = dealerChargeType === 'value' ? dealerCharge : (buybox_new_listing_price / 100) * dealerCharge;
            const delvCharge = deliveryChargeType === 'value' ? deliveryCharge : ((buybox_new_listing_price / 100) * deliveryCharge);
            return {
                price: Number(buybox_new_listing_price + dealCharge).toFixed(2),
                deliveryCharge: Number(delvCharge).toFixed(2),
                asin
            }
        });
        const productsList = amznProducts.map(amzn => {
            const product = _.omit(amzn, ['_id', 'buybox_new_landed_price', 'buybox_new_listing_price', 'buybox_new_shipping_price']);
            return product;
        });
        const deletePrice = asin.map(async a => {
            const deleted = await empty('PRICE', { asin: a });
            return deleted;
        });
        await Promise.all(deletePrice).then(async deleted => {
            if (deleted) {
                await post('PRICE', { insertMode: 'insertMany' }, priceList);
            }
        });
        const deleteProducts = asin.map(async a => {
            const deleted = await empty('PRODUCTS', { asin: a });
            return deleted;
        });
        await Promise.all(deleteProducts).then(async deleted => {
            if (deleted) {
                await post('PRODUCTS', { insertMode: 'insertMany' }, productsList);
            }
        });
        count = amznProducts.length;
        return { message: `${count} Products Affected` };
    } else {
        return { message: `${count} Products Affected` };
    }
}

const localeLogs = async () => {
    const filter = {};
    filter.active = true;
    const categoryList = await get('LOCALE-LOGS', filter);
    return categoryList;
}

const localeLog = async (id) => {
    if (id) {
        const singleJob = await get('LOCALE-LOGS', { _id: ObjectID(id) });
        return singleJob;
    }
}

const logProdCount = async ({ log, category, subCategory }) => {
    if (log) {
        log = Number(log);
        const length = await count('AMZ-SCRAPPED-DATA', { category, subCategory });
        const countUpdate = await update('LOCALE-LOGS', { log }, { count: length });
        return countUpdate;
    }
}

const addLocaleLog = async (data) => {
    data.log = new Date().getTime();
    data.active = true;
    data.loggedBy = 'DEVELOPER';
    data.loggedOn = moment().format();
    const { category, subCategory, locale } = data;
    const filter = { category, subCategory };
    const length = await count('AMZ-SCRAPPED-DATA', filter);
    data.count = length;
    const newJob = await post('LOCALE-LOGS', { insertMode: 'insertOne' }, data);
    const message = newJob ? 'Log Added' : 'Error Adding Log';
    return { message };
}

const deleteLocaleLog = async (log) => {
    if (log) {
        const singleJob = await inactivate('LOCALE-LOGS', { log });
        return singleJob;
    }
}

module.exports = { locales, locale, addLocale, deleteLocale, updateProducts, localeLogs, localeLog, addLocaleLog, deleteLocaleLog, logProdCount };