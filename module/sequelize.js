// Components
const Sequelize = require("sequelize");
const dotEnv = require("dotenv");
dotEnv.config();

// Models
const StoreModel = require("../models/store");
const ProductModel = require("../models/product");
const promoStoreModel = require("../models/promoStore");
const promoProductModel = require("../models/promoProduct");

// Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    pool: {
      max: 10,
      min: 0,
      idle: 10000,
    },
    logging: function (str) {
      if (process.env.SEQ_LOGGING === "true") {
        console.log(str);
      }
    },
  }
);

// Initialize models
const Store = StoreModel(sequelize, Sequelize);
const Product = ProductModel(sequelize, Sequelize);

const PromoStore = promoStoreModel(sequelize, Sequelize);
const PromoProduct = promoProductModel(sequelize, Sequelize);

// Associations
Store.hasMany(Product, {
  foreignKey: {
    name: "storeId",
    allowNull: false,
  },
});
Product.belongsTo(Store);

Store.hasMany(PromoStore, {
  foreignKey: {
    name: "storeId",
    allowNull: false,
  },
});
PromoStore.belongsTo(Store);

Product.hasOne(PromoProduct, {
  foreignKey: {
    name: "productId",
    allowNull: false,
  },
});
PromoProduct.belongsTo(Product);

// Sync with database
sequelize
  .sync(/*{force: (process.env.SEQ_FORCE_SYNC === 'true')}*/) // Do not use force, will drop table
  .then(() => {});

// Export models
module.exports = {
  sequelize,
  Store,
  Product,
  PromoStore,
  PromoProduct,
};
