"use strict";
const fs = require('fs')
const utils = require('../module/utils');
const base64Img = require("base64-img");
const { spawn } = require("child_process");
const { nanoid } = require("nanoid");

let storeLabel = require('../assets/classes/store.json');
let productLabel = require('../assets/classes/product.json');

const waitingTime = 20000;

async function Detection(router, sequelizeObjects) {
  router.get("/get/test", async (req, res) => {
    console.log("get test");
    res.status(200).json({
      message: 'Server OK.',
    });
  });
  
  /*
  Detection Endpoint

  request: image base64 format, type of detection
  respone: result of detection in json format

  convert base64 to image then wait for detection result from python function
  */
  router.post("/detection", async (req, res) => {
    const { base64, type } = req.body;
    let dir = `../python/images/${type}`;

    if (!base64 || !fs.existsSync(dir)) {
      return res.status(400).json('bad request');
    }

    // Convert base64 to image
    const fileName = nanoid();
    var filepath = base64Img.imgSync(base64, dir, fileName);
    let processed_path = `../python/processed/${type}/${fileName + '.txt'}`;

    console.log(processed_path);

    // Wait for result .txt file 
    utils.waitFor(() => fs.existsSync(processed_path), waitingTime)
      .then(async () => {
        console.log("found result!");
        const results = utils.syncReadFile(processed_path);

        // In case of detect store front image
        if (type == 'store') {
          const id = Number(results[0].split(",", 1));
          const store = storeLabel[id];
          console.log(store.storeId);
          const output = utils.getStoreName(store.storeId, sequelizeObjects)

          if (output) {
            res.status(200).json({
              success: true,
              result: output,
            });
          } else {
            res.status(200).json({
              success: false,
              result: output,
            });
          }
        
        // In case of detect product image
        } else if (type == 'product') {
          const outputs = [];
          const tmpLabel = [];
          const labels = [];

          // Searching all labels in results file 
          for (const result of results) {
            const id = Number(result.split(",", 1));
            // skip duplicate label
            const found = tmpLabel.find(element => element === id);
            if (found) { continue; }
            tmpLabel.push(id);
            const label = productLabel[id];
            console.log(label);
            labels.push(label);
            const products = utils.searchProduct(label, sequelizeObjects);
            for (const product of products) {
              outputs.push(product);
            }
          }
          // Response
          if (outputs.length > 0) {
            res.status(200).json({
              success: true,
              results: outputs,
              labels: labels,
            });
          } else {
            res.status(204).json({
              success: false,
              results: outputs,
              labels: labels,
            });
          }
        }
      })
      
      // Waiting more than limit
      .catch(() => {
        console.log("require time out!");
        res.status(408).json({ message: 'require time out' });
      });

  });
}

exports.Detection = Detection;
