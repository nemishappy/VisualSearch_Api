"use strict";
const base64Img = require("base64-img");
const { spawn } = require("child_process");

async function TestAPI(router) {
  router.get("/get/test", async (req, res) => {
    console.log("get test");
    console.log(__dirname);
    var dataToSend;
    // spawn new child process to call the python script
    const python = spawn("python", ["models/script.py"]);
    // collect data from script
    python.stdout.on("data", function (data) {
      console.log("Pipe data from python script ...");
      dataToSend = data.toString();
    });
    // in close event we are sure that stream from child process is closed
    python.on("close", (code) => {
      console.log(`child process close all stdio with code ${code}`);
      // send data to browser
      res.send(dataToSend);
    });
    // res.json({ id: 3 });
  });
  router.post("/post/test", async (req, res) => {
    const { image } = req.body;
    console.log(image);
    base64Img.img(image, "./img", Date.now(), function (err, filepath) {
      const pathArr = filepath.split("/");
      const fileName = pathArr[pathArr.length - 1];

      res.status(200).json({
        success: true,
        fileName: `${fileName}`,
      });
    });
  });
}

exports.TestAPI = TestAPI;
