//require library multer that handle file uploads
const multer = require("multer");
// built in function that handle path of file 
const path = require("path");

//configure storage 
const storage = multer.diskStorage({
    //tells multer where to save uploads files 
  destination: function (req, file, cb) {
    cb(null, "uploads/");//file path 
  },
  //generate a unique file name for each upload 
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);//random number to make file name more unique 
    cb(null, uniqueSuffix + path.extname(file.originalname));//make it original file exstension 
  },
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    //filter for only confirmed types 
    const allowedTypes = /jpeg|jpg|png|webp/;
    const isValid = allowedTypes.test(
        //get the file exstension 
      path.extname(file.originalname).toLowerCase(),
    );
    if (isValid) {
        //file is accepted
      cb(null, true);
    } else {
        //file is jejected
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  //limits file size to 5MB
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
