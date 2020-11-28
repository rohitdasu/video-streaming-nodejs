const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const port = process.env.PORT || 3000;
const location = "D:/MyDevelopment/node-backend"

/**
 * Multer Configuration
 */
const storage = multer.diskStorage({
    destination: (req, file, cb) => { // cb stands for callback
        cb(null, "./public/images");
    },
    filename: (req, file, cb) => {
      let filetype = "";
      if (file.mimetype === "image/png") {
          filetype = "png";
        }
      if (file.mimetype === "image/jpeg") {
          filetype = "jpg";
        }
      cb(null, "image-" + Date.now() + "." + filetype);
    },
  });

  let upload = multer({ storage: storage });

  /******************************************************************************* */

  router.get("/", (req, res) => {
    res.send("this is media route");
  });

  
  /**Post Image **/
  router.post("/upload", upload.single("file"), function (req, res) {

    if (!req.file) {
      res.status(400).json({
          status:'failure',
          message:'empty file'
      });
      return;
    }

    let hostedin = req.protocol + "://" + req.hostname + ":" + port;
    let actualfilepath = hostedin+ `/public/images/` + req.file.filename; // store this path to database and give to UI

    res.json({file:actualfilepath});
  });

  router.get("/video", (req, res)=> {
    const range = req.headers.range;
    if(!range){
      return;
    }
    const videoPath = `${location}/public/videos/khairiyat.mp4`;
    const videoSize = fs.statSync(videoPath).size;

    const CHUNK_SIZE = 10 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE , videoSize - 1);

    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": `bytes`,
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, headers);

    const videoStream = fs.createReadStream(videoPath, {start, end});

    videoStream.pipe(res);
  })

 
module.exports = router;