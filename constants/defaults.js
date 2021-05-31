const port = 8000;
const host = 'https://www.amazon.com';
const login = `${host}ap/signin?openid.pape.max_auth_age=0&openid.return_to=https://www.amazon.in/ref=nav_ya_signin&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.assoc_handle=inflex&openid.mode=checkid_setup&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select&openid.ns=http://specs.openid.net/auth/2.0`;
const dbHost = "mongodb+srv://exborder:exborder321@cluster0.xsetj.mongodb.net/test";
const jQ = "./libs/jquery-3.5.1.slim.min.js";
const collectionsToEmpty = [
    'AMZ-SCRAPPED-DATA', 'JOBS', 'LOCALE', 'LOCALE-LOGS', 'PRICE', 'PRODUCTS', 'NOTIFICATIONS'
]
const storage = {
    port: 8001,
    scrapPort: 8000
}
const downloadProducts = {
    'label': 'Nama Produk*',
    'description': 'Deskripsi Produk',
    'category': 'Kategori Kode*',
    'item_dimensions_weight': 'Berat* (Gram)',
    'price': 'Harga (Rp)*'
}

const orderStatus = {
    SID_0: 'Seller cancel order',
    SID_2: 'Order Reject Replaced',
    SID_3: 'Order Reject Due Empty Stock',
    SID_4: 'Order Reject Approval',
    SID_5: 'Order Canceled by Fraud',
    SID_10: 'Order rejected by seller',
    SID_11: 'Order Pending Replacement',
    SID_100: 'Pending order',
    SID_103: 'Wait for payment confirmation from third party',
    SID_200: 'Payment confirmation',
    SID_220: 'Payment verified, order ready to process',
    SID_221: 'Waiting for partner approval',
    SID_400: 'Seller accept order',
    SID_450: 'Waiting for pickup',
    SID_500: 'Order shipment',
    SID_501: 'Status changed to waiting resi have no input',
    SID_520: 'Invalid shipment reference number (AWB)',
    SID_530: 'Requested by user to correct invalid entry of shipment reference number',
    SID_540: 'Delivered to Pickup Point',
    SID_550: 'Return to Seller',
    SID_600: 'Order delivered',
    SID_601: 'Buyer open a case to finish an order',
    SID_690: 'Fraud Review',
    SID_691: 'Suspected Fraud',
    SID_695: 'Post Fraud Review',
    SID_698: 'Finish Fraud Review',
    SID_699: 'Order invalid or shipping more than 25 days and payment more than 5 days',
    SID_700: 'Order finished',
    SID_701: 'Order assumed as finished but the product not arrived yet to the buyer'
}

const tokoConfig = {
    clientId: 'f9fc210831164f5382ade315816f0ad8',
    clientSecretKey: 'ed3a4554fdbe4c608e6481eb158c5448',
    fsId: 15125
}

module.exports = { port, host, login, dbHost, jQ, storage, collectionsToEmpty, downloadProducts, orderStatus, tokoConfig };