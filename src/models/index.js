const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize");

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.User  = require('./user')(sequelize, DataTypes);
db.Designation = require('./designation')(sequelize, DataTypes);
db.Task = require('./task')(sequelize, DataTypes);
db.TaskLog = require('./taskLog')(sequelize, DataTypes);
db.Product = require('./product')(sequelize, DataTypes);
db.Notification = require('./notification')(sequelize, DataTypes);
db.ServerPort = require('./serverPort')(sequelize, DataTypes);
db.UserProduct = require('./userProduct')(sequelize, DataTypes);


// Associate models
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
      db[modelName].associate(db);
  }
});


// db.sequelize.sync({ force: false })
//   .then(() => {
//     console.log("yes! re-sync done");
//   });

module.exports = db;
