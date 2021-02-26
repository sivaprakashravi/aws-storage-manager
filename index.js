// Default Imports
const _ = require('lodash');
const { success, error } = require('./utils/handlers');
const messages = require('./utils/messages');
const routes = require('./routes');
const { storage } = require('./constants/defaults');
const { categories, addCategory, emptyAllCategory } = require('./processors/categories-processor');
const { jobs, addJob } = require('./processors/jobs-processor');
const { configuration, setConfiguration, inactivateConfiguration } = require('./processors/configuration-processor');
const { port } = storage;
const moment = require('moment');

const arm = (tryBlock) => {
    try {
        tryBlock();
    } catch (e) {
        res.send(error(e));
    }
}

routes.get('MASTER', (req, res) => {
    res.send(success(null, messages.MASTER));
});

routes.post('ADDSCRAP', (req, res) => {
    res.send(success(null, messages.AMAZONPARENT));
});

routes.get('GETJOBS', async (req, res) => {
    arm(async () => {
        const job = await jobs();
        if(job) {
            res.send(success(job));
        }
    });
});

routes.post('ADDJOB', async (req, res) => {
    arm(async () => {
        if(req && req.body) {
            const newJob = req.body;
            newJob.createdAt = moment().format();
            newJob.scheduleId = new Date().getTime();
            newJob.status = 'NEW';
            newJob.scheduledBy = 'DEVELOPER';
            const job = await addJob(newJob);
            if(job) {
                res.send(success(job));
            }
        }
    });
});

routes.post('ADDCATEGORY', (req, res) => {
    arm(async () => {
        const removeAllCategories = await emptyAllCategory();
        if(removeAllCategories) {
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
        if(removeAllCategories && req.body) {
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

routes.listen(port);