const { get, count, post, update, inactivate, empty } = require('./mongo-client-processor');
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');
const { weightType, weightCalc } = require('./../utils/formatter');
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
    data.variationFactor = Number(data.variationFactor);
    data.volumetricWtFactor = Number(data.volumetricWtFactor);
    data.packingCost = Number(data.packingCost);
    data.freightUD = Number(data.freightUD);
    data.freightDC = Number(data.freightDC);
    data.ccpKG = Number(data.ccpKG);
    data.ccpHAWB = Number(data.ccpHAWB);
    data.sensitiveCargo = Number(data.sensitiveCargo);
    data.handlingCharges = Number(data.handlingCharges);
    data.markUp = Number(data.markUp);
    data.beaCukai = Number(data.beaCukai);
    data.pfComission = Number(data.pfComission);
    data.ppn = Number(data.ppn);
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
        await update('LOCALE-LOGS', { log: body.log }, { status: 'applied', recursive: body.recursive });

    }
    let { category, subCategory } = body;
    const localeObj = await locale(body.locale);
    const { variationFactor, volumetricWtFactor, packingCost, freightUD, freightDC, ccpKG, ccpHAWB, sensitiveCargo, handlingCharges, markUp, beaCukai, pfComission, ppn } = localeObj[0];
    const filter = { category, subCategory };
    const amznProducts = await get('AMZ-SCRAPPED-DATA', filter);
    let count = 0;
    if (amznProducts && amznProducts.length) {
        const asin = amznProducts.map(a => a.asin);
        const priceList = amznProducts.map(({ buybox_new_listing_price, asin, item_dimensions_weight }) => {
            const prodPrice = Number(buybox_new_listing_price);
            let weight = 0;
            if (item_dimensions_weight) {
                const wCalc = weightType(item_dimensions_weight);
                weight = weightCalc(wCalc);
            }
            variationFactorCalc = prodPrice * variationFactor;
            volumetricWtFactorCalc = weight * volumetricWtFactor;
            freightUDCalc = volumetricWtFactorCalc * freightUD;
            freightDCCalc = volumetricWtFactorCalc * freightDC;
            ccpKGCalc = weight * ccpKG;
            const defs = packingCost + ccpHAWB + sensitiveCargo + handlingCharges;
            const pbc = defs + variationFactorCalc + volumetricWtFactorCalc + freightUDCalc + freightDCCalc + ccpKGCalc;
            const markUpCalc = (pbc / 100) * markUp;
            const pamk = pbc + markUpCalc;
            const sellingPrice = (pamk * 100) / (100 - 7.5 - 7.5 - 16.766);
            const beaCukaiCalc = (sellingPrice / 100) * beaCukai;
            const pfComissionCalc = (sellingPrice / 100) * pfComission;
            const ppnCalc = (pamk + beaCukaiCalc + pfComissionCalc) * (100 / ppn);
            const exchange = 16500;
            const finalPrice = sellingPrice * exchange;
            return {
                markUp: markUpCalc,
                priceAfterMarkUp: pamk,
                bEA: beaCukaiCalc,
                platformComission: pfComissionCalc,
                ppn: ppnCalc,
                price: Number(finalPrice).toFixed(2),
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