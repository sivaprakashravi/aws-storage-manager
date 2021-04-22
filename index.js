// Default Imports
const _ = require('lodash');
const { success, error } = require('./utils/handlers');
const messages = require('./utils/messages');
const routes = require('./routes');
const { storage, collectionsToEmpty } = require('./constants/defaults');
const { categories, addCategory, newCategory, emptyAllCategory, updateStoreInfo, updateCategory, removeCategory } = require('./processors/categories-processor');
const { products, addProduct, processedProducts, localeProducts, downloadProcessedProducts, product, grouByAMZN } = require('./processors/products-processor');
const { jobs, addJob, updateJobStatus, stopJob, deleteJob, pauseJob, recursiveJob, primeJob } = require('./processors/jobs-processor');
const { configuration, setConfiguration, inactivateConfiguration } = require('./processors/configuration-processor');
const { locales, addLocale, deleteLocale, updateProducts, localeLogs, addLocaleLog, deleteLocaleLog, recursiveLocaleLog, logProdCount } = require('./processors/locale-processor');
const { port } = storage;
const moment = require('moment');
const { emptyDB } = require('./processors/db-processor');
const { addNotification, notifications, notificationsCount } = require('./processors/notification-processor');
const { orders, orderStatuses } = require('./processors/orders.processor');
const { addUser, loginUser, addRole, getUsers, getRoles, updateRole, deleteRole, confirmUser, resendConfiration } = require('./processors/user-processor');

const arm = (tryBlock) => {
    try {
        tryBlock();
    } catch (e) {
        console.log(e);
        res.send(error(e));
    }
}

routes.get('MASTER', (req, res) => {
    res.send(success(null, messages.MASTER));
});

routes.get('GETJOBS', async(req, res) => {
    arm(async() => {
        const job = await jobs(req.query);
        if (job) {
            res.send(success(job));
        }
    });
});

routes.post('ADDJOB', async(req, res) => {
    arm(async() => {
        if (req && req.body) {
            const newJob = req.body;
            const job = await addJob(newJob);
            if (job) {
                res.send(success(job));
            }
        }
    });
});

routes.get('JOBSTATUS', async(req, res) => {
    arm(async() => {
        const { id, scheduleId } = req.params;
        if (req && req.params && id && scheduleId) {
            const { percentage, status, address, message } = req.query;
            const statusResponse = await updateJobStatus(id, scheduleId, percentage, status, address, message);
            if (statusResponse) {
                res.send(success(statusResponse));
            }
        }
    })
});

routes.get('STOPJOB', async(req, res) => {
    arm(async() => {
        const stopped = await stopJob(req);
        res.send(success(stopped));
    });
});

routes.post('ADDPRODUCT', async(req, res) => {
    arm(async() => {
        if (req && req.body) {
            const newProduct = req.body;
            newProduct.createdOn = moment().format();
            const job = await addProduct(newProduct);
            if (job) {
                res.send(success(job));
            }
        }
    });
});

routes.get('GETPRODUCT', async(req, res) => {
    arm(async() => {
        const { params } = req;
        if (params) {
            const job = await product({ params });
            res.send(success(job));
        }
    });
});

routes.post('ADDCATEGORY', (req, res) => {
    arm(async() => {
        const removeAllCategories = await emptyAllCategory();
        if (removeAllCategories) {
            const categoriesList = await addCategory(req.body);
            res.send(success(categoriesList));
        }
    });
});

routes.post('NEWCATEGORY', (req, res) => {
    arm(async() => {
        const categoriesList = await newCategory(req.body);
        if (categoriesList && categoriesList.message) {
            res.status(409).send(error(categoriesList.message));
        } else {
            res.send(success(categoriesList));
        }
    });
});

routes.delete('DELETEJOB', (req, res) => {
    arm(async() => {
        const { scheduleId } = req.query;
        if (scheduleId) {
            const id = Number(scheduleId);
            const deleted = await deleteJob(id);
            if (deleted) {
                res.send(success(deleted));
            } else {
                res.status(409).send(error({ message: 'Something went wrong' }));
            }
        }
    });
});

routes.get('PAUSEJOB', (req, res) => {
    arm(async() => {
        const { scheduleId } = req.query;
        if (scheduleId) {
            const id = Number(scheduleId);
            const deleted = await jobs({ scheduleId: id });
            if (deleted && deleted[0]) {
                const { _id, paused } = deleted[0];
                const pause = pauseJob(_id, id, !paused);
                res.send(success(pause));
            } else {
                res.status(409).send(error({ message: 'Something went wrong' }));
            }
        }
    });
});

routes.get('PRIMEJOB', (req, res) => {
    arm(async() => {
        const { scheduleId } = req.query;
        if (scheduleId) {
            const id = Number(scheduleId);
            const deleted = await jobs({ scheduleId: id });
            if (deleted && deleted[0]) {
                const { _id, prime } = deleted[0];
                const pause = primeJob(_id, id, !prime);
                res.send(success(pause));
            } else {
                res.status(409).send(error({ message: 'Something went wrong' }));
            }
        }
    });
});

routes.get('RECURSIVEJOB', (req, res) => {
    arm(async() => {
        const { scheduleId } = req.query;
        if (scheduleId) {
            const id = Number(scheduleId);
            const deleted = await jobs({ scheduleId: id });
            if (deleted && deleted[0]) {
                const { _id, recursive } = deleted[0];
                const pause = recursiveJob(_id, id, !recursive);
                res.send(success(pause));
            } else {
                res.status(409).send(error({ message: 'Something went wrong' }));
            }
        }
    });
});

routes.put('UPDATECATEGORY', (req, res) => {
    const body = req.body;
    arm(async() => {
        if (body) {
            const updated = await updateCategory(body);
            res.send(success(updated));
        }
    });
});

routes.delete('REMOVECATEGORY', (req, res) => {
    const { nId } = req.query;
    arm(async() => {
        if (nId) {
            const updated = await removeCategory(nId);
            res.send(success(updated));
        }
    });
});

routes.put('UPDATESTOREINFO', (req, res) => {
    const { category, subCategory, subCategory1, storeId, categoryCode } = req.query;
    arm(async() => {
        if (category) {
            const updated = await updateStoreInfo(category, subCategory, subCategory1, storeId, categoryCode);
            res.send(success(updated));
        }
    });
});

routes.get('GETCATEGORY', async(req, res) => {
    arm(async() => {
        const categoriesList = await categories();
        res.send(success(categoriesList));
    });
});

routes.post('SETCONFIGURATION', (req, res) => {
    arm(async() => {
        const removeAllCategories = await inactivateConfiguration('CONFIGURATION');
        if (removeAllCategories && req.body) {
            const config = await setConfiguration('CONFIGURATION', req.body);
            res.send(success(config));
        }
    });
});

routes.get('GETCONFIGURATION', async(req, res) => {
    arm(async() => {
        const config = await configuration('CONFIGURATION');
        res.send(success(config));
    });
});

routes.post('SETUSERCONFIGURATION', (req, res) => {
    arm(async() => {
        const removeAllCategories = await inactivateConfiguration('USERCONFIGURATION');
        if (removeAllCategories && req.body) {
            const config = await setConfiguration('USERCONFIGURATION', req.body);
            res.send(success(config));
        }
    });
});

routes.get('GETUSERCONFIGURATION', async(req, res) => {
    arm(async() => {
        const config = await configuration('USERCONFIGURATION');
        res.send(success(config));
    });
});

routes.get('LOCALE', async(req, res) => {
    arm(async() => {
        const config = await locales();
        res.send(success(config));
    });
});

routes.post('ADDLOCALE', async(req, res) => {
    arm(async() => {
        const config = await addLocale(req.body);
        res.send(success(config));
    });
});

routes.delete('DELETELOCALE', async(req, res) => {
    arm(async() => {
        if (req && req.query && req.query.localeId) {
            const localeRemoved = await deleteLocale(Number(req.query.localeId));
            res.send(success(localeRemoved));
        }
    });
});

routes.post('UPDATEPRODUCTS', async(req, res) => {
    arm(async() => {
        const config = await updateProducts(req);
        res.send(success(config));
    });
});

routes.get('LOCALELOGS', async(req, res) => {
    arm(async() => {
        const config = await localeLogs();
        res.send(success(config));
    });
});

routes.post('ADDLOCALELOG', async(req, res) => {
    arm(async() => {
        const config = await addLocaleLog(req.body);
        res.send(success(config));
    });
});

routes.delete('ARCHIVELOCALELOG', async(req, res) => {
    arm(async() => {
        if (req && req.query && req.query.log) {
            const localeRemoved = await deleteLocaleLog(Number(req.query.log));
            res.send(success(localeRemoved));
        }
    });
});

routes.get('RECURSIVELOCALELOG', async(req, res) => {
    arm(async() => {
        if (req && req.query && req.query.log) {
            const recursiveUpdated = await recursiveLocaleLog(Number(req.query.log));
            res.send(success(recursiveUpdated));
        }
    });
});

routes.delete('DBEMPTY', async(req, res) => {
    arm(async() => {
        const collectionPromises = [];
        if (collectionsToEmpty && collectionsToEmpty.length) {
            collectionsToEmpty.forEach(cName => {
                collectionPromises.push(new Promise(async(resolve, reject) => {
                    try {
                        const collectionEmptied = await emptyDB(cName);
                        resolve(collectionEmptied);
                        console.log(`${cName} Cleared!`)
                    } catch (e) {
                        reject(e);
                    }
                }));
            });
        }
        Promise.all(collectionPromises).then(d => {
            res.send(d);
        });
    });
});

routes.get('REFRESHLOCALELOG', async(req, res) => {
    arm(async() => {
        const count = await logProdCount(req.query);
        res.send(success(count));
    });
});

routes.get('PROCESSEDPRODUCTS', async(req, res) => {
    arm(async() => {
        const pdts = await processedProducts(req);
        res.send(success(pdts));
    });
});

routes.get('ALLPRODUCTS', async(req, res) => {
    arm(async() => {
        const pdts = await localeProducts(req.body);
        res.send(success(pdts));
    });
})

routes.get('PROCESSEDPRODUCTSDOWNLOAD', async(req, res) => {
    arm(async() => {
        const pdts = await downloadProcessedProducts(req);
        res.send(success(pdts));
    });
});

routes.get('GETNOTIFICATIONS', async(req, res) => {
    arm(async() => {
        const pdts = await notifications(req.body);
        res.send(success(pdts));
    });
});

routes.get('NOTIFICATIONUPDATEALL', async(req, res) => {
    arm(async() => {
        const pdts = await updateAllNotifications();
        res.send(success(pdts));
    });
});

routes.get('NOTIFICATIONCOUNT', async(req, res) => {
    arm(async() => {
        const pdts = await notificationsCount();
        res.send(success(pdts));
    });
});

routes.post('ADDNOTIFICATION', async(req, res) => {
    arm(async() => {
        const config = await addNotification(req.body);
        res.send(success(config));
    });
});

routes.get('GETORDERS', async(req, res) => {
    arm(async() => {
        const pdts = await orders();
        res.send(success(pdts));
    });
});

routes.get('ORDERSSTATUSES', async(req, res) => {
    arm(async() => {
        const pdts = await orderStatuses();
        res.send(success(pdts));
    });
});

routes.post('ADDUSER', async(req, res) => {
    arm(async() => {
        const config = await addUser(req);
        if (config && config.status && config.status !== 200) {
            res.status(config.status).send(error(config.message));
        } else {
            res.send(success(config));
        }
    });
});

routes.post('LOGINUSER', async(req, res) => {
    arm(async() => {
        const config = await loginUser(req);
        if (config && config.status && config.status !== 200) {
            res.status(config.status).send(error(config.message));
        } else {
            res.send(success(config));
        }
    });
});

routes.get('GETUSER', async(req, res) => {
    arm(async() => {
        if (req && req.params && req.params.email) {
            const pdts = await getUsers({ email: (req.params.email).toUpperCase() });
            res.send(success(pdts));
        } else {
            res.send(success({ message: 'No Email Provided' }));
        }
    });
});

routes.post('CONFIRMUSER', async(req, res) => {
    arm(async() => {
        const config = await confirmUser(req);
        if (config && config.status && config.status !== 'success') {
            res.status(config.status).send(error(config.message));
        } else {
            res.send(success(config));
        }
    });
});

routes.post('RESENDVERIFCATION', async(req, res) => {
    arm(async() => {
        const config = await resendConfiration(req);
        if (config && config.status && config.status !== 'success') {
            res.status(config.status).send(error(config.message));
        } else {
            res.send(success(config));
        }
    });
});

routes.get('GETUSERS', async(req, res) => {
    arm(async() => {
        let pdts = await getUsers();
        pdts = pdts.filter(r => r.role !== 1);
        res.send(success(pdts));
    });
});

routes.post('ADDROLE', async(req, res) => {
    arm(async() => {
        const config = await addRole(req);
        res.send(success(config));
    });
});

routes.get('GETROLES', async(req, res) => {
    arm(async() => {
        const filter = req.query;
        const pdts = await getRoles(filter);
        res.send(success(pdts));
    });
});

routes.put('ADDROLE', async(req, res) => {
    arm(async() => {
        const config = await updateRole(req.body);
        res.send(success(config));
    });
});

routes.delete('DELETEROLE', async(req, res) => {
    arm(async() => {
        if (req && req.params && req.params.roleId) {
            const roleRemoved = await deleteRole(req.params.roleId);
            res.send(success(roleRemoved));
        }
    });
});

routes.get('AMZNGROUPING', async(req, res) => {
    arm(async() => {
        const filter = req.query;
        const pdts = await grouByAMZN(filter);
        res.send(success(pdts));
    });
});

routes.listen(port);