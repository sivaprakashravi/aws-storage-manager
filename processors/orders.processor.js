const { get, post, empty, inactivate } = require('./mongo-client-processor');
const { json } = require('./../constants/data');
const { orderStatus, tokoConfig } = require('./../constants/defaults');
const axios = require('axios');
const btoa = require('btoa');
const orders = async (query) => {
    const token = await clientToken();
    const headers = {
        Authorization: `Bearer ${token}`
    };
    // "https://fs.tokopedia.net/v2/order/list?fs_id=15125&from_date=1621714066&to_date=1621906666&page=1&per_page=10"

    const auth = await axios.get(`https://fs.tokopedia.net/v2/order/list?fs_id=${tokoConfig.fsId}&from_date=${query.from}&to_date=${query.to}&page=1&per_page=10`,
        {headers}
    );
    if(auth && auth.data && auth.data.data) {
        return auth.data.data;
    } else {
        return [];
    }
}
const clientToken = async () => {
    const token = btoa(`${tokoConfig.clientId}:${tokoConfig.clientSecretKey}`);
    const headers = {
        Authorization: `Basic ${token}`
    };
    const auth = await axios.post('https://accounts.tokopedia.com/token?grant_type=client_credentials', {}, { headers });
    if (auth && auth.data && auth.data.access_token) {
        return auth.data.access_token;
    } else {
        return false;
    }

}
const orderStatuses = () => orderStatus;

module.exports = { orders, orderStatuses };