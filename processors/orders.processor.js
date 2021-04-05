const { get, post, empty, inactivate } = require('./mongo-client-processor');
const { json } = require('./../constants/data');
const { orderStatus } = require('./../constants/defaults');
const orders = async () => {
    // let allOrders = await get('GETORDERS');
    // allOrders = allOrders && allOrders.length ? allOrders[0] : {};
    const jsonOrders = json.orders;
    json.orders.forEach(j => {
        j.status = orderStatus[`SID_${j.order_status}`]
    });
    return jsonOrders;
}
const orderStatuses = () => orderStatus;

module.exports = { orders, orderStatuses };