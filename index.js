// Default Imports
const _ = require('lodash');
const { success, error } = require('./utils/handlers');
const messages = require('./utils/messages');
const routes = require('./routes');
const { storage } = require('./constants/defaults');
const { categories, addCategory, emptyAllCategory } = require('./processors/categories-processor');
const { products, addProduct } = require('./processors/products-processor');
const { jobs, addJob, updateJobStatus } = require('./processors/jobs-processor');
const { configuration, setConfiguration, inactivateConfiguration } = require('./processors/configuration-processor');
const { locales, addLocale, deleteLocale, updateProducts } = require('./processors/locale-processor');
const { port } = storage;
const moment = require('moment');

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

routes.get('GETJOBS', async (req, res) => {
    arm(async () => {
        const job = await jobs(req);
        if (job) {
            res.send(success(job));
        }
    });
});

routes.post('ADDJOB', async (req, res) => {
    arm(async () => {
        if (req && req.body) {
            const newJob = req.body;
            const job = await addJob(newJob);
            if (job) {
                res.send(success(job));
            }
        }
    });
});

routes.get('JOBSTATUS', async (req, res) => {
    arm(async () => {
        const { id, scheduleId } = req.params;
        if (req && req.params && id && scheduleId) {
            const { percentage, status } = req.query;
            const statusResponse = await updateJobStatus(id, scheduleId, percentage, status);
            if (statusResponse) {
                res.send(success(statusResponse));
            }
        }
    })
});

routes.post('ADDPRODUCT', async (req, res) => {
    arm(async () => {
        if (req && req.body) {
            const newProduct = req.body;
            newProduct.createdAt = moment().format();
            const job = await addProduct(newProduct);
            if (job) {
                res.send(success(job));
            }
        }
    });
});

routes.post('ADDCATEGORY', (req, res) => {
    arm(async () => {
        const removeAllCategories = await emptyAllCategory();
        if (removeAllCategories) {
            const categoriesList = await addCategory(req.body);
            res.send(success(categoriesList));
        }
    });
});

routes.get('GETCATEGORY', async (req, res) => {
    arm(async () => {
        const categoriesList = await categories();
        res.send(success(categoriesList));
    });
});

routes.post('SETCONFIGURATION', (req, res) => {
    arm(async () => {
        const removeAllCategories = await inactivateConfiguration();
        if (removeAllCategories && req.body) {
            const config = await setConfiguration(req.body);
            res.send(success(config));
        }
    });
});

routes.get('GETCONFIGURATION', async (req, res) => {
    arm(async () => {
        const config = await configuration();
        res.send(success(config));
    });
});

routes.get('LOCALE', async (req, res) => {
    arm(async () => {
        const config = await locales();
        res.send(success(config));
    });
});

routes.post('ADDLOCALE', async (req, res) => {
    arm(async () => {
        const config = await addLocale(req.body);
        res.send(success(config));
    });
});

routes.delete('DELETELOCALE', async (req, res) => {
    arm(async () => {
        if (req && req.query && req.query.localeId) {
            const localeRemoved = await deleteLocale(Number(req.query.localeId));
            res.send(success(localeRemoved));
        }
    });
});

routes.post('UPDATEPRODUCTS', async (req, res) => {
    arm(async () => {
        const config = await updateProducts(req);
        res.send(success(config));
    });
});

routes.listen(port);