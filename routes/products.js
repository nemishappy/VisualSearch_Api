"use strict";
const imageUtils = require("../module/imageUtils");
const path = require("path");
const dotEnv = require("dotenv");
dotEnv.config();

function _validProduct(product) {
  var validataion = ["productName", "imagePath", "imageName", "price"];
  var missing = [];
  validataion.forEach((item) => {
    if (!(item in product)) {
      return false;
    }
  });
  return true;
}

async function Products(router, sequelizeObjects) {
  // Add products data with store id key
  router.post("/product/add", async (req, res) => {
    let insertComplete = false;
    let added = [];
    const data = req.body;
    console.log(data);
    if (data.storeId) {
      for (const product of data.products) {
        console.log(product);
        if (_validProduct(product)) {
          if (!product.price || !Number.isInteger(product.price)) {
            console.log("price invalid :", product.name);
            return;
          }
          let productId;

          await sequelizeObjects.Product.create({
            storeId: data.storeId,
            productName: product.productName,
            imagePath: product.imagePath,
            imageName: product.imageName,
            price: product.price,
          })
            .then(function (item) {
              console.log("create product records id: ", item.id);
              console.log(item.toJSON());
              let result = item.toJSON();
              productId = item.id;
              added.push(result.productName);
              insertComplete = true;
            })
            .catch(function (err) {
              console.log(err.name);
              insertComplete = false;
            });
          if (product.promotion) {
            var startDate = new Date(
              product.promotion.startDate
            ).toLocaleString();
            var endDate = new Date(product.promotion.endDate).toLocaleString();

            await sequelizeObjects.PromoProduct.create({
              productId: productId,
              tittle: product.promotion.tittle,
              promotionPrice: product.promotion.promotionPrice,
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
      }
    }

    if (insertComplete) {
      res.status(200).json({
        success: true,
        message: `Product has been added to database: ${added}`,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Fail to insert to the database.",
      });
    }
  });

  // Add promotion to the database with product id key
  router.post("/product/promotion/add", async (req, res) => {
    let insertComplete = false;
    const data = req.body;
    let id = data.productId;
    console.log(data);

    if (id) {
      var startDate = new Date(data.startDate).toLocaleString();
      var endDate = new Date(data.endDate).toLocaleString();

      await sequelizeObjects.PromoProduct.create({
        productId: id,
        tittle: data.tittle,
        promotionPrice: data.promotionPrice,
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

    if (insertComplete) {
      res.status(200).json({
        success: true,
        message: `Store has been added to database with id : ${id}`,
      });
    } else {
      res.status(400).json({
        success: false,
        message: `Fail to insert to database.`,
      });
    }
  });

  // Queries all product
  router.get("/product/getall", async (req, res) => {
    let outputs = [];
    // Find all products
    const products = await sequelizeObjects.Product.findAll({
      include: sequelizeObjects.PromoProduct
    });
    console.log(
      products.every((prod) => prod instanceof sequelizeObjects.Product)
    ); // true
    for (const product of products) {
      outputs.push({
        productId: product.id,
        storeId: product.storeId,
        productName: product.productName,
        imagePath: product.imagePath,
        imageName: product.imageName,
        price: product.price,
        promotions: product.PromoProduct,
      });
    }
    console.log("All products:", JSON.stringify(products, null, 2));
    if (outputs.length) {
      res.status(200).json(outputs);
    } else {
      res.status(404).json(outputs);
    }
  });

  // Queries product by id key
  router.get("/product/get", async (req, res) => {
    let outputs = [];
    const id = req.query.id;
    // Find product by pk
    const product = await sequelizeObjects.Product.findByPk(id, {
      include: sequelizeObjects.PromoProduct,
    });
    if (product === null) {
      console.log("Not found!");
      res.status(404).json("Not found!");
    } else {
      console.log(product instanceof sequelizeObjects.Product); // true
      res.status(200).json(product);
    }
  });
}

exports.Products = Products;
