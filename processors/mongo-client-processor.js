const MongoClient = require('mongodb').MongoClient;
const { dbHost } = require('./../constants/defaults');
const ObjectID = require('mongodb').ObjectID;

const get = async (collectionName, filters = {}, projection = {}, sort = { createdOn: -1 }, limit = 0) => {
    // projection._id = 0;
    return new Promise((resolve, reject) => {
        MongoClient.connect(dbHost, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, db) => {
            if (err) reject(err);
            var dbo = db.db("ECOM-CONSUMER");
            dbo.collection(collectionName).find(filters, { projection }).sort(sort).limit(limit).toArray((err, documents) => {
                if (err) reject(err);
                else {
                    resolve(documents);
                }
                db.close();
            });
        });
    }).then(d => d);
}

const getSync = async (collectionName, filters = {}, projection = {}, pageNo = 1, limit = 25) => {
    // projection._id = 0;
    pageNo = Number(pageNo);
    limit = Number(limit);
    return new Promise((resolve, reject) => {
        MongoClient.connect(dbHost, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, db) => {
            if (err) reject(err);
            var dbo = db.db("ECOM-CONSUMER");
            dbo.collection(collectionName).find(filters, { projection }).sort({ createdOn: -1 })
                .limit(limit).skip(limit * (pageNo - 1)).toArray((err, documents) => {
                    if (err) reject(err);
                    else {
                        resolve(documents);
                    }
                    db.close();
                });
        });
    }).then(d => d).catch(e => console.log(e));
}


// .find(queryFind).sort(querySort)
//    .limit(limit).skip(limit*(page-1), function(err, logItems) {
//        if (!err) {
//          return res.json(logItems);
//        } else {
//          return res.send({error: err});
//        }
//    })});


const count = async (collectionName, filters = {}) => {
    // projection._id = 0;
    return new Promise((resolve, reject) => {
        MongoClient.connect(dbHost, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, db) => {
            if (err) reject(err);
            var dbo = db.db("ECOM-CONSUMER");
            dbo.collection(collectionName).find(filters).count((err, count) => {
                if (err) reject(err);
                else {
                    resolve(count);
                }
                db.close();
            });
        });
    }).then(d => d);
}

const post = (collectionName, options, data) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(dbHost, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, db) => {
            if (err) reject(err);
            var dbo = db.db("ECOM-CONSUMER");
            dbo.collection(collectionName)[options.insertMode](data, (err, res) => {
                if (err) reject(err);
                // console.log("1 document inserted");
                db.close();
                resolve(true);
            });
        });
    }).then(d => d);
}

const update = (collectionName, query, values) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(dbHost, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, db) => {
            if (err) reject(err);
            var dbo = db.db("ECOM-CONSUMER");
            dbo.collection(collectionName).updateOne(query,
                { $set: values },
                // { upsert: true },
                function (err, res) {
                    if (err) throw err;
                    // console.log("1 document updated");
                    db.close();
                    resolve(true);
                });
        });
    }).then(d => d);
}

const empty = (collectionName, filters = {}) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(dbHost, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, db) => {
            if (err) reject(err);
            var dbo = db.db("ECOM-CONSUMER");
            dbo.collection(collectionName).deleteMany(filters, (err, res) => {
                if (err) reject(err);
                console.log(`Documents removed from ${collectionName}`);
                db.close();
                resolve(true);
            });
        });
    }).then(d => d);
}

const inactivate = async (collectionName, filters) => {
    filters.active = true;
    const selection = await get(collectionName, filters);
    if (selection && selection[0]) {
        filters._id = selection[0]._id;
        return new Promise((resolve, reject) => {
            MongoClient.connect(dbHost, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }, (err, db) => {
                if (err) reject(err);
                var dbo = db.db("ECOM-CONSUMER");
                dbo.collection(collectionName).updateOne(filters,
                    { $set: { active: false } },
                    // { upsert: true },
                    function (err, res) {
                        if (err) throw err;
                        // console.log("1 document updated");
                        db.close();
                        resolve(true);
                    });
            });
        }).then(d => d);
    } else {
        return false;
    }
}



const groupBy = async (collectionName, match, group) => {
    // projection._id = 0;
    return new Promise((resolve, reject) => {
        MongoClient.connect(dbHost, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, db) => {
            if (err) reject(err);
            var dbo = db.db("ECOM-CONSUMER");
            dbo.collection(collectionName).aggregate([
                { $match: match },
                { $group: group }]).toArray((err, d) => {
                    if (err) reject(err);
                    else {
                        resolve(d);
                    }
                    db.close();
                });
        });
    }).then(d => d);
}

module.exports = { get, getSync, count, post, update, empty, inactivate, groupBy };