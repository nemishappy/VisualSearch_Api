"use strict";
const imageUtils = require("../module/imageUtils");
const path = require("path");
const dotEnv = require("dotenv");
dotEnv.config();

function _validStore(store) {
  var validataion = [
    "storeName",
    "imagePath",
    "imageName",
    "logoPath",
    "logoName",
  ];
  var missing = [];
  validataion.forEach((item) => {
    if (!(item in store)) {
      console.log(item);
      missing.push(item);
    }
  });
  return missing;
}

async function Stores(router, sequelizeObjects) {
  // Add store and promotions data to database
  router.post("/store/add", async (req, res) => {
    let insertComplete = false;
    let id;
    const data = req.body;
    console.log(data);

    // Validation
    const missing = _validStore(data);
    if (!missing.length) {
      // Insert store data
      await sequelizeObjects.Store.create({
        storeName: data.storeName,
        imagePath: data.imagePath,
        imageName: data.imageName,
        logoPath: data.logoPath,
        logoName: data.logoName,
      })
        .then(function (item) {
          console.log("create store records id: ", item.id);
          console.log(item.toJSON());
          insertComplete = true;
          id = item.id;
        })
        .catch(function (err) {
          console.log(err.name);
          insertComplete = false;
        });
    }

    // Insert promotion of store
    if (data.promotions) {
      for (const item of data.promotions) {
        var startDate = new Date(item.startDate).toLocaleString();
        var endDate = new Date(item.endDate).toLocaleString();

        await sequelizeObjects.PromoStore.create({
          storeId: id,
          tittle: item.tittle,
          description: item.description,
          startDate: startDate,
          endDate: endDate,
        })
          .then(function (promo) {
            console.log("create promotion records id: ", promo.id);
            insertComplete = true;
          })
          .catch(function (err) {
            // handle error;'
            console.log(err.name);
            insertComplete = false;
            return;
          });
      }
    }

    // Response
    if (insertComplete) {
      res.status(200).json({
        success: true,
        message: `Store has been added to database with id : ${id}`,
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Require missing field : ${missing}`,
      });
    }
  });

  // Add promotion data with store id key to the database
  router.post("/store/promotion/add", async (req, res) => {
    let insertComplete = false;
    const data = req.body;
    let id = data.storeId;
    console.log(data);

    // Check store id
    if (id) {
      for (const item of data.promotions) {
        var startDate = new Date(item.startDate).toLocaleString();
        var endDate = new Date(item.endDate).toLocaleString();

        // Insert data
        await sequelizeObjects.PromoStore.create({
          storeId: id,
          tittle: item.tittle,
          description: item.description,
          startDate: startDate,
          endDate: endDate,
        })
          .then(function (promo) {
            insertComplete = true;
            console.log("create promotion records id: ", promo.id);
          })
          .catch(function (err) {
            // handle error
            console.log(err.name);
            insertComplete = false;
            return;
          });
      }
    }

    // Response
    if (insertComplete) {
      res.status(200).json({
        success: true,
        message: `Store has been added to database with id : ${id}`,
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Fail to insert to the database.`,
      });
    }
  });

  // Queries all product
  router.get("/store/getall", async (req, res) => {
    let outputs = [];
    // Find all stores
    const stores = await sequelizeObjects.Store.findAll({
      include: sequelizeObjects.PromoStore,
    });
    console.log(stores.every((prod) => prod instanceof sequelizeObjects.Store)); // true
    for (const store of stores) {
      outputs.push({
        storeId: store.id,
        storeName: store.storeName,
        imagePath: store.imagePath,
        imageName: store.imageName,
        logoPath: store.logoPath,
        logoName: store.logoName,
        promotions: store.PromoStores,
        // products: store.products,
      });
    }
    console.log("All stores:", JSON.stringify(stores, null, 2));
    if (outputs.length) {
      res.status(200).json(outputs);
    } else {
      res.status(404).json(outputs);
    }
  });

  // Queries store by id key
  router.get("/store/get", async (req, res) => {
    let outputs = [];
    const id = req.query.id;
    // Find store by pk
    const store = await sequelizeObjects.Store.findByPk(id, {
      include: [sequelizeObjects.PromoStore, sequelizeObjects.Product],
    });
    if (store === null) {
      console.log("Not found!");
      res.status(404).json("Not found!");
    } else {
      console.log(store instanceof sequelizeObjects.Store); // true
      res.status(200).json(store);
    }
  });
}

exports.Stores = Stores;
