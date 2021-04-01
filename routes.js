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
    JOBLOG: '/job/log/:id/:scheduleId',
    STOPJOB: '/job/stop/:id/:scheduleId',
    ADDCATEGORY: '/category/add',
    NEWCATEGORY: '/category/new',
    GETCATEGORY: '/category/all',
    UPDATECATEGORY: '/category/update',
    UPDATESTOREINFO: '/category/store/update',
    GETCONFIGURATION: '/configuration/all',
    SETCONFIGURATION: '/configuration',
    ADDPRODUCT: '/product/add',
    GETPRODUCT: '/product/:asin',
    LOCALE: '/locale/all',
    ADDLOCALE: '/locale/add',
    DELETELOCALE: '/locale/delete',
    UPDATEPRODUCTS: '/locale/apply',
    LOCALELOGS: '/locale/log/all',
    ADDLOCALELOG: '/locale/log/add',
    ARCHIVELOCALELOG: '/locale/log/archive',
    REFRESHLOCALELOG: '/locale/log/refresh',
    PROCESSEDPRODUCTS: '/products/processed/all',
    ALLPRODUCTS: '/products/all',
    PROCESSEDPRODUCTSDOWNLOAD: '/product/download',
    DBEMPTY: '/db/empty',
    ADDNOTIFICATION: '/notification/add',
    GETNOTIFICATIONS: '/notification/all',
    NOTIFICATIONCOUNT: '/notification/count',
    NOTIFICATIONUPDATEALL: '/notification/update/all'
};

module.exports = {
    get: async (route, callBack) => {
        app.get(routes[route], callBack);
    },
    post: async (route, callBack) => {
        app.post(routes[route], callBack);
    },
    put: async (route, callBack) => {
        app.put(routes[route], callBack);
    },
    delete: async (route, callBack) => {
        app.delete(routes[route], callBack);
    },
    listen: (port) => {
        app.listen(port, () => {
            process.setMaxListeners(Infinity);
            console.log(`${messages.APPRUNNING} ~~ ${port}`);
        });
    }
}