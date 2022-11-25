"use strict";
const base64Img = require("base64-img");
const { spawn } = require("child_process");
const { customAlphabet } = require("nanoid");
const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 10);

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

async function TestAPI(router) {
  // router.get("/get/test", async (req, res) => {
  //   console.log("get test");
  //   console.log(__dirname);
  //   var dataToSend;
  //   // spawn new child process to call the python script
  //   const python = spawn("python", ["models/script.py"]);
  //   // collect data from script
  //   python.stdout.on("data", function (data) {
  //     console.log("Pipe data from python script ...");
  //     dataToSend = data.toString();
  //   });
  //   // in close event we are sure that stream from child process is closed
  //   python.on("close", (code) => {
  //     console.log(`child process close all stdio with code ${code}`);
  //     // send data to browser
  //     res.send(dataToSend);
  //   });
  //   // res.json({ id: 3 });
  // });

  
  router.post("/post/test", async (req, res) => {
    const { image } = req.body;
    // console.log(image);
    const fileName = nanoid() + "_" + Date.now();
    let filePath = "";
    base64Img.img(image, "./img", fileName, function (err, filepath) {
      filePath = filepath;
    });
    let flag = false;

    // waitFor((_) => flag === true).then((_) => {
    //   console.log("the wait is over!");
    //   res.status(200).json({
    //     success: true,
    //     fileName: `${fileName}`,
    //   });
    // });

    sleepUntil(() => flag === true, 5000)
      .then(() => {
        console.log("the wait is over!");
        res.status(200).json({
          success: true,
          fileName: `${fileName}`,
        });
      })
      .catch(() => {
        console.log("require time out!");
        res.status(408);
      });

    // var _TIMEOUT = 1000; // waitfor test rate [msec]
    // var bBusy = true; // Busy flag (will be changed somewhere else in the code)
    // // Test a flag
    // function _isBusy() {
    //   return bBusy;
    // }
    // // Wait until idle (busy must be false)
    // waitfor(_isBusy, false, _TIMEOUT, 0, "play->busy false", function () {
    //   console.log("the wait is over!");
    //   res.status(200).json({
    //     success: true,
    //     fileName: `${name}`,
    //   });
    // });
    // setTimeout(function () {
    //   bBusy = false;
    //   // console.log("the wait is over!");
    //   // res.status(200).json({
    //   //   success: true,
    //   //   fileName: `${name}`,
    //   // });
    // }, 3000);
  });
}

exports.TestAPI = TestAPI;
