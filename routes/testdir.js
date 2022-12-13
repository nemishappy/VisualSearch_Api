"use strict";
const fs = require('fs')
const base64Img = require("base64-img");
const { spawn } = require("child_process");
const { nanoid } = require("nanoid");

let storeLabel = require('../assets/classes/store.json');
let productLabel = require('../assets/classes/product.json');

function waitFor(conditionFunction) {
  const poll = (resolve) => {
    if (conditionFunction()) resolve();
    else setTimeout((_) => poll(resolve), 1000);
  };

  return new Promise(poll);
}

const sleepUntil = async (f, timeoutMs) => {
  return new Promise((resolve, reject) => {
    const timeWas = new Date();
    const wait = setInterval(function () {
      if (f()) {
        console.log("resolved after", new Date() - timeWas, "ms");
        clearInterval(wait);
        resolve();
      } else if (new Date() - timeWas > timeoutMs) {
        // Timeout
        console.log("rejected after", new Date() - timeWas, "ms");
        clearInterval(wait);
        reject();
      }
    }, 1000);
  });
};

function syncReadFile(filename) {
  const contents = fs.readFileSync(filename, 'utf-8');

  const arr = contents.split(/\r?\n/);

  arr.pop()
  console.log(arr);

  return arr;
}

async function searchProduct(query, sequelizeObjects) {
  let outputs = [];
  // Find product by string
  const Sequelize = sequelizeObjects.sequelize;
  let lookupValue = query.toLowerCase();
  await sequelizeObjects.Product.findAll({
    limit: 10,
    where: {
      productName: Sequelize.where(Sequelize.fn('LOWER', Sequelize.fn('REPLACE', Sequelize.col('productName'), ' ', '')), 'LIKE', '%' + lookupValue + '%')

    }
  }).then(function (results) {
    outputs = results;
  }).catch(function (error) {
    console.log(error);
  });
  // console.log(outputs);
  return outputs;
}


async function TestAPI(router, sequelizeObjects) {
  router.get("/get/test", async (req, res) => {
    console.log("get test");
    let processed_path = `../python/processed/store/${'pUqSfCNUbi' + '.txt'}`;
    // let rawdata = fs.readFileSync('./assets/classes/store.json');
    const result = syncReadFile(processed_path);
    const id = Number(result[0].split(",", 1));
    const store = storeLabel[id];
    console.log(store.storeId);
    res.status(200).json({
      message: 'Server OK.',
    });
  });


  router.post("/post/test", async (req, res) => {
    const { base64, type } = req.body;
    let dir = `../python/images/${type}`;

    if (!base64 || !fs.existsSync(dir)) {
      return res.status(400).json('bad request');
    }
    const fileName = nanoid();
    var filepath = base64Img.imgSync(base64, dir, fileName);
    // let pathArr = filepath.split("/");
    let processed_path = `../python/processed/${type}/${fileName + '.txt'}`;

    console.log(processed_path);
    // fs.rename(filePath, processed_path, function (err) {
    //   if (err) throw err
    //   console.log('Successfully renamed - AKA moved!')
    // })

    sleepUntil(() => fs.existsSync(processed_path), 10000)
      .then(async () => {
        console.log("found result!");
        const result = syncReadFile(processed_path)

        const id = Number(result[0].split(",", 1));
        if (type == 'store') {
          const store = storeLabel[id];
          console.log(store.storeId);

          res.status(200).json({
            success: true,
            result: store.storeId,
          });
        } else if (type == 'product') {
          const label = productLabel[id];
          console.log(label);
          const results = await searchProduct(label, sequelizeObjects)

          res.status(200).json({
            success: true,
            result: results,
          });
        }
      })
      .catch(() => {
        console.log("require time out!");
        res.status(408).json({ message: 'require time out' });
      });

  });
}

exports.TestAPI = TestAPI;
