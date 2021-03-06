const { get, post, inactivate, empty } = require('./mongo-client-processor');
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');
const _ = require('lodash');
const locales = async () => {
    const filter = {};
    filter.active = true;
    const categoryList = await get('LOCALE', filter);
    return categoryList;
}

const locale = async (id) => {
    if (id) {
        const singleJob = await get('LOCALE', { _id: ObjectID(id) });
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
    const { category, subCategory, locale } = body;
    const { dealerCharge, deliveryCharge, dealerChargeType, deliveryChargeType } = locale;
    const filter = { category, subCategory };
    const amznProducts = await get('AMZ-SCRAPPED-DATA', filter);
    let count = 0;
    if (amznProducts && amznProducts.length) {
        const asin = amznProducts.map(a => a.asin);
        const priceList = amznProducts.map(({ buybox_new_listing_price, asin }) => {
            const dealCharge = dealerChargeType === 'value' ? dealerCharge : (buybox_new_listing_price / 100) * dealerCharge;
            const delvCharge = deliveryChargeType === 'value' ? buybox_new_listing_price + deliveryCharge : buybox_new_listing_price + ((buybox_new_listing_price / 100) * deliveryCharge);
            return {
                price: buybox_new_listing_price + dealCharge,
                deliveryCharge: delvCharge,
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

const addLocaleLog = async (data) => {
    data.log = new Date().getTime();
    data.active = true;
    data.loggedBy = 'DEVELOPER';
    data.loggedOn = moment().format();
    const newJob = await post('LOCALE-LOGS', { insertMode: 'insertOne' }, data);
    return newJob;
}

const deleteLocaleLog = async (localeId) => {
    if (localeId) {
        const singleJob = await inactivate('LOCALE-LOGS', { localeId });
        return singleJob;
    }
}

module.exports = { locales, locale, addLocale, deleteLocale, updateProducts, localeLogs, localeLog, addLocaleLog, deleteLocaleLog };