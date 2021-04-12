const { default: axios } = require('axios');
const { ObjectID } = require('bson');
const { get, post, update, count, empty } = require('./mongo-client-processor');
const dataList = async (collectionName) => {
    // filter.active = true;
    const list = await count(collectionName);
    return list;
}
const addInCognito = async (user) => {
    try {
        const add = await axios.post('http://localhost:8002/user/register', user);
        return add;
    } catch (e) {
        const { status, data } = e.response;
        return { status, data };
    }
}

const addUser = async (req) => {
    if (req.body) {
        const addCognito = await addInCognito(req.body);
        if (addCognito && addCognito.status && addCognito.status !== 200) {
            const { status, data } = addCognito;
            return { status, message: data.message };
        } else {
            const user = req.body;
            user.role = user.role.roleId;
            const addinDB = await post('USERS', { insertMode: 'insertOne' }, req.body);
            return addinDB;
        }
    }
}

const getUsers = async (filter = {}) => {
    const users = await get('USERS', filter);
    return users;
}

const loginUser = async (req) => {
    try {
        const add = await axios.post('http://localhost:8002/user/login', req.body);
        return add.data;
    } catch (e) {
        const { status, data } = e.response;
        return { status, message: data.message };
    }
}

const confirmUser = async (req) => {
    try {
        const add = await axios.post('http://localhost:8002/user/confirm', req.body);
        return add.data;
    } catch (e) {
        const { status, data } = e.response;
        return { status, message: data.message };
    }
}

const resendConfiration = async (req) => {
    try {
        const add = await axios.post('http://localhost:8002/user/newVerificationCode', req.body);
        return add.data;
    } catch (e) {
        const { status, data } = e.response;
        return { status, message: data.message };
    }
}

const addRole = async (req) => {
    const role = req.body;
    if (role && role.name) {
        role.roleId = new Date().getTime();
        role.config = {
            scheduler: {
                view: true,
                edit: false,
                delete: false
            },
            locale: {
                view: true,
                edit: false,
                delete: false
            },
            products: {
                view: true,
                edit: false,
                delete: false
            },
            category: {
                view: true,
                edit: false,
                delete: false
            },
            orders: {
                view: true,
                edit: false,
                delete: false
            },
        }
        const addinDB = await post('ROLES', { insertMode: 'insertOne' }, role);
        return addinDB;
    }
}

const getRoles = async (filter = {}) => {
    if(filter.roleId) {
        filter.roleId = Number(filter.roleId);
    }
    const users = await get('ROLES', filter);
    return users;
}

const updateRole = async (role) => {
    const filter = {
        _id: ObjectID(role._id)
    }
    const uRole = role;
    delete uRole._id;
    const updated = await update('ROLES', filter, uRole);
    return updated
}

const deleteRole = async (id) => {
    if (id) {
        const dFilter = {
            _id: ObjectID(id)
        }
        const deleted = await empty('ROLES', dFilter);
        return deleted;
    }
}

module.exports = { addUser, loginUser, confirmUser, resendConfiration, addRole, getUsers, getRoles, updateRole, deleteRole };