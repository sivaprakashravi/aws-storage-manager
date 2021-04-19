const { get, count, post, update, inactivate, empty } = require('./mongo-client-processor');
const ObjectID = require('mongodb').ObjectID;
const moment = require('moment');
const { weightType, weightCalc, random } = require('./../utils/formatter');
const { product, localeProducts } = require('./products-processor');
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
    data.ccv = Number(data.ccv);
    const newJob = await post('LOCALE', { insertMode: 'insertOne' }, data);
    return newJob;
}

const deleteLocale = async (localeId) => {
    if (localeId) {
        const singleJob = await inactivate('LOCALE', { localeId });
        return singleJob;
    }
}

// const newSKU = async () => {
//     let newNumber = random();
//     const isSKUExists = await product({ sku: newNumber });
//     if (isSKUExists && isSKUExists.length) {
//         newNumber = await newSKU();
//     }
//     return newNumber;
// }

const newSKU = async (mapper, index, onlyNumber) => {
    const id = String(mapper.id ? mapper.id : 0).padStart(2, '0');
    const amzn = '01';
    const sku = new RegExp(`^SKU${amzn}${id}`);
    const sort = { $natural: -1 };
    const lastRecord = await product({ sku }, {}, sort, 1);
    let newNumber = '0001';
    let val = 0;
    if (lastRecord && lastRecord[0] && lastRecord[0].sku) {
        val = Number(lastRecord[0].sku.substr(-4));
    }
    newNumber = val + 1 + index;
    newNumber = String(newNumber).padStart(4, '0');
    const isSKUExists = await product({ sku: `SKU${amzn}${id}${newNumber}` });
    if (isSKUExists && isSKUExists.length) {
        newNumber = await newSKU(mapper, index, true);
    }
    if (onlyNumber) {
        return newNumber;
    } else {
        return `SKU${amzn}${id}${newNumber}`;
    }
}

const updateProducts = async ({ body }) => {
    if (!body.noSave) {
        await addLocaleLog(body);
    } else {
        await update('LOCALE-LOGS', { log: body.log }, { status: 'applied', recursive: body.recursive });

    }
    let { category, subCategory, subCategory1 } = body;
    const localeObj = await locale(body.locale);
    const filter = { category, subCategory, subCategory1 };
    const amznProducts = await get('AMZ-SCRAPPED-DATA', filter);
    let count = 0;
    if (amznProducts && amznProducts.length) {
        const localeJob = localeObj[0];
        const priceList = await priceUpdate(amznProducts, localeJob);
        const asin = amznProducts.map(a => a.asin);
        const productsList = amznProducts.map(amzn => {
            const product = _.omit(amzn, ['_id', 'buybox_new_landed_price', 'buybox_new_listing_price', 'buybox_new_shipping_price', 'salePrice', 'shippingPrice']);
            return product;
        });
        const deletePrice = asin.map(async a => {
            const deleted = await update('PRICE', { asin: a }, { active: false });
            return deleted;
        });
        await Promise.all(deletePrice).then(async deleted => {
            if (deleted) {
                await post('PRICE', { insertMode: 'insertMany' }, priceList);
            }
        });
        const deleteProducts = asin.map(async a => {
            const prod = await localeProducts({ asin: a });
            const deleted = await empty('PRODUCTS', { asin: a });
            if (deleted) {
                return { asin: a, sku: prod.sku };
            }
        });
        await Promise.all(deleteProducts).then(async deleted => {
            if (deleted) {
                const skus = [];
                productsList.forEach((p, pi) => {
                    skus.push(new Promise(async (resolve, reject) => {
                        try {
                            const existingSKU = deleted.find(d => d.asin === p.asin);
                            if (!existingSKU) {
                                const skuNumber = await newSKU(p, pi);
                                p.sku = skuNumber;
                            } else {
                                p.sku = existingSKU.sku ? existingSKU.sku : await newSKU(p, pi);
                            }
                            const amznUpdate = await update('AMZ-SCRAPPED-DATA', { asin: p.asin }, { localed: true });
                            if (amznUpdate) {
                                resolve();
                            }
                        } catch (e) {
                            reject(e);
                        }
                    }));
                });
                Promise.all(skus).then(async () => {
                    await post('PRODUCTS', { insertMode: 'insertMany' }, productsList);
                })
            }
        });
        count = amznProducts.length;
        return { message: `${count} Products Affected` };
    } else {
        return { message: `${count} Products Affected` };
    }
}

const localeLogs = async (filter = {}) => {
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

const logProdCount = async ({ log, category, subCategory, subCategory1, subCategory2, subCategory3 }) => {
    let filter = { category, subCategory, subCategory1, subCategory2, subCategory3 };
    filter = _.pickBy(filter, v => v);
    if (log) {
        log = Number(log);
        const scrapperCount = await count('AMZ-SCRAPPED-DATA', { category, subCategory });
        const countUpdate = await update('LOCALE-LOGS', { log }, { count: scrapperCount });
        return countUpdate;
    } else {
        const scrapperCount = await count('AMZ-SCRAPPED-DATA', filter);
        return scrapperCount;
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
const recursiveLocaleLog = async (log) => {
    if (log) {
        const isLog = await localeLogs({ log });
        const recursiveApplied = await update('LOCALE-LOGS', { log }, { recursive: !isLog[0].recursive });
        return recursiveApplied;
    }
}

const priceUpdate = async (amznProducts, localeJob) => {
    const { localeId, variationFactor, volumetricWtFactor, packingCost, freightUD, freightDC, ccpKG, ccpHAWB, sensitiveCargo, handlingCharges, markUp, beaCukai, pfComission, ppn, ccv } = localeJob;
    const priceList = amznProducts.map(({ salePrice, shippingPrice, asin, item_dimensions_weight }) => {
        const prodPrice = (salePrice ? Number(salePrice) : 0) + (shippingPrice ? Number(shippingPrice) : 0);
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
        const sellingPrice = (pamk * 100) / (100 - beaCukai - pfComission - 16.766);
        const beaCukaiCalc = (sellingPrice / 100) * beaCukai;
        const pfComissionCalc = (sellingPrice / 100) * pfComission;
        const ppnCalc = (pamk + beaCukaiCalc + pfComissionCalc) * (ppn / 100);
        const exchange = ccv ? ccv : 1;
        const finalPrice = sellingPrice * exchange;
        return {
            markUp: markUpCalc,
            priceAfterMarkUp: pamk,
            bEA: beaCukaiCalc,
            platformComission: pfComissionCalc,
            ppn: ppnCalc,
            price: prodPrice ? Number(finalPrice).toFixed(2) : 0,
            asin,
            localeId,
            active: true
        };
    });
    return priceList;
}

module.exports = { locales, locale, addLocale, deleteLocale, updateProducts, localeLogs, localeLog, addLocaleLog, deleteLocaleLog, recursiveLocaleLog, logProdCount, priceUpdate };