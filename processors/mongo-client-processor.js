const MongoClient = require('mongodb').MongoClient;
const { dbHost } = require('./../constants/defaults');
const get = async (collectionName, filters) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(dbHost, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, db) => {
            if (err) reject(err);
            var dbo = db.db("ECOM-CONSUMER");
            dbo.collection(collectionName).find(filters).sort({ createdAt: -1 }).toArray((err, documents) => {
                if (err) reject(err);
                else {
                    resolve(documents);
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
                console.log("1 document inserted");
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
            dbo.collection(collectionName).updateOne(query, values, function (err, res) {
                if (err) throw err;
                console.log("1 document updated");
                db.close();
                resolve(true);
            });
        });
    }).then(d => d);
}

const empty = (collectionName) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(dbHost, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, db) => {
            if (err) reject(err);
            var dbo = db.db("ECOM-CONSUMER");
            dbo.collection(collectionName).deleteMany({}, () => {
                if (err) reject(err);
                console.log(`All Documents removed from ${collectionName}`);
                db.close();
                resolve(true);
            });
        });
    }).then(d => d);
}

const inactivate = (collectionName) => {
    return new Promise((resolve, reject) => {
        MongoClient.connect(dbHost, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }, (err, db) => {
            if (err) reject(err);
            var dbo = db.db("ECOM-CONSUMER");
            dbo.collection(collectionName).find({ 'active': true }, (err) => {
                if (err) reject(err);
                console.log(`All Documents removed from ${collectionName}`);
                db.close();
                resolve(true);
            });
            dbo.collection(collectionName).findOneAndUpdate({ active: true }, { $set: { active: false } }, { upsert: true },
                (err) => {
                    if (err) reject(err);
                    console.log(`All Documents Updated from ${collectionName}`);
                    db.close();
                    resolve(true);

                }
            );
        });
    }).then(d => d);
}

module.exports = { get, post, update, empty, inactivate };