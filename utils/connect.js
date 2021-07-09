var MongoClient = require("mongodb").MongoClient;
const CONFIG = require("../constants/defaults");

const state = {
  db: null
};
/*function to connect to database*/
module.exports = {
  connect: successfulConnection => {
    if (state.db) {
      successfulConnection(state.db, null);
    } else {
      MongoClient.connect(CONFIG.dbHost, {
        poolSize: 20,
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
        .then((db, err) => {
          if (err) {
            if (state.db) {
              state.db.close();
            }
            successfulConnection(null, err);
          } else {
            state.db = db.db(CONFIG.dbName);
            successfulConnection(state.db, null);
          }
        })
        .catch(dberr => {
          successfulConnection(null, dberr);
        });
    }
  }
};
