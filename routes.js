const express = require('express');
const cors = require('cors');
const messages = require('./utils/messages');
const app = express();
const bodyParser = require("body-parser");
const auth = require("./handlers/auth-handler");
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// Add headers for CORS
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

const unAuthorized = (res) => {
    res.status(401).send({
        errorCode: 401,
        error: 'Unauthorized'
    });
};

// app.use(async (req, res) => {
//     const exceptions = ['/user/login', '/user/confirm', '/user/newVerificationCode'];
//     try {
//         if (req && req.path && (exceptions.indexOf(req.path) > - 1)) {
//             return req.next();
//         }
//         else if (req && req.headers && req.headers['authorization']) {
//             const token = req.headers['authorization'];
//             req.user = auth.ValidateToken(token);
//             if (req.user && req.user.valid) {
//                 return req.next();
//             } else {
//                 unAuthorized(res);
//             }
//         } else {
//             unAuthorized(res);
//         }
//     } catch (e) {
//         unAuthorized(res);
//     }
// });
const routes = {
    MASTER: '/',
    ADDJOB: '/job/create',
    DELETEJOB: '/job/delete',
    PAUSEJOB: '/job/pause',
    RECURSIVEJOB: '/job/recursive',
    PRIMEJOB: '/job/prime',
    GETJOBS: '/job/all',
    JOBSTATUS: '/job/status/:id/:scheduleId',
    JOBLOG: '/job/log/:id/:scheduleId',
    STOPJOB: '/job/stop/:id/:scheduleId',
    ADDCATEGORY: '/category/add',
    NEWCATEGORY: '/category/new',
    GETCATEGORY: '/category/all',
    REMOVECATEGORY: '/category/delete',
    UPDATECATEGORY: '/category/update',
    UPDATESTOREINFO: '/category/store/update',
    GETCONFIGURATION: '/configuration/all',
    SETCONFIGURATION: '/configuration',
    GETUSERCONFIGURATION: '/configuration/user/all',
    SETUSERCONFIGURATION: '/configuration/user',
    ADDPRODUCT: '/product/add',
    GETPRODUCT: '/product/:asin',
    LOCALE: '/locale/all',
    ADDLOCALE: '/locale/add',
    DELETELOCALE: '/locale/delete',
    UPDATEPRODUCTS: '/locale/apply',
    LOCALELOGS: '/locale/log/all',
    ADDLOCALELOG: '/locale/log/add',
    ARCHIVELOCALELOG: '/locale/log/archive',
    RECURSIVELOCALELOG: '/locale/log/recursive',
    REFRESHLOCALELOG: '/locale/log/refresh',
    PROCESSEDPRODUCTS: '/products/processed/all',
    ALLPRODUCTS: '/products/all',
    PROCESSEDPRODUCTSDOWNLOAD: '/products/download',
    DBEMPTY: '/db/empty',
    ADDNOTIFICATION: '/notification/add',
    GETNOTIFICATIONS: '/notification/all',
    NOTIFICATIONCOUNT: '/notification/count',
    NOTIFICATIONUPDATEALL: '/notification/update/all',
    GETORDERS: '/orders/all',
    ORDERSSTATUSES: '/orders/statuses',
    ADDUSER: '/user/add',
    GETUSERS: '/user/all',
    LOGINUSER: '/user/login',
    GETUSER: '/user/login/:email',
    CONFIRMUSER: '/user/confirm',
    RESENDVERIFCATION: '/user/newVerificationCode',
    ADDROLE: '/user/role/add',
    DELETEROLE: '/user/role/delete/:roleId',
    GETROLES: '/user/role/all',
    UPDATEROLES: '/user/role/update',
    AMZNGROUPING: '/scrap/grouping'
};

module.exports = {
    get: async(route, callBack) => {
        app.get(routes[route], callBack);
    },
    post: async(route, callBack) => {
        app.post(routes[route], callBack);
    },
    put: async(route, callBack) => {
        app.put(routes[route], callBack);
    },
    delete: async(route, callBack) => {
        app.delete(routes[route], callBack);
    },
    listen: (port) => {
        app.listen(port, () => {
            process.setMaxListeners(Infinity);
            console.log(`${messages.APPRUNNING} ~~ ${port}`);
        });
    }
}