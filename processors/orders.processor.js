const { json } = require('./../constants/data');
const { orderStatus, tokoConfig } = require('./../constants/defaults');
const axios = require('axios');
const btoa = require('btoa');
const moment = require('moment');
const orders = async (query) => {
    const { from, to } = query;
    if (from && to) {
        const diff = moment.unix(from).diff(moment.unix(to), 'days');
        const token = await clientToken();
        const headers = {
            Authorization: `Bearer ${token}`
        };
        // "https://fs.tokopedia.net/v2/order/list?fs_id=15125&from_date=1621714066&to_date=1621906666&page=1&per_page=10"
        try {
            const url = 'https://fs.tokopedia.net/v2/order/list';
            const params = {
                fs_id: tokoConfig.fsId,
                from_date: from,
                to_date: to,
                page: 1,
                per_page: 10
            };
            const options = { params: params, headers: headers };
            const auth = await axios.get(url, options);
            if (auth && auth.data && auth.data.data) {
                return auth.data.data;
            } else {
                return [];
            }
        } catch(e) {
            return e.response;
        }
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