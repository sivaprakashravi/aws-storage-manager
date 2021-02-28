const { get, post } = require('./mongo-client-processor');
const products = async () => {
    const productList = await get('PRODUCTS');
    return productList;
}
const addProduct = async (data) => {
    const productInsert = await post('PRODUCTS', {insertMode: 'insertOne'}, data);
    return productInsert;
}

module.exports = { products, addProduct };