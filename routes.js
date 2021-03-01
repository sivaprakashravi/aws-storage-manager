const express = require('express');
const cors = require('cors');
const messages = require('./utils/messages');
const app = express();
const bodyParser = require("body-parser");
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const routes = {
    MASTER: '/',
    ADDJOB: '/job/create',
    GETJOBS: '/job/all',
    JOBSTATUS: '/job/status/:id/:scheduleId',
    ADDCATEGORY: '/category/add',
    GETCATEGORY: '/category/all',
    GETCONFIGURATION: '/configuration/all',
    SETCONFIGURATION: '/configuration',
    ADDPRODUCT: '/product/add'
};

module.exports = {
    get: async (route, callBack) => {
        app.get(routes[route], callBack);
    },
    post: async (route, callBack) => {
        app.post(routes[route], callBack);
    },
    listen: (port) => {
        app.listen(port, () => {
            process.setMaxListeners(Infinity);
            console.log(`${messages.APPRUNNING} ~~ ${port}`);
        });
    }
}