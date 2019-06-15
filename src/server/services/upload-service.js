const multer = require('multer');
const log = require('../config.js').log();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        log.info("Mimetype: " + file.mimetype);
        
        if (file.mimetype.includes("image/")){
            log.info("Uploading image file..")
            log.info("req.params.path: " + req.params.path);
            // PROD
            // if(process.env.PROD === "true"){
                
            //     cb(null, `/var/www/chatitapp.com/public/assets/uploads/${req.params.path}/${req.params.id}/images`);
            // }else{
            cb(null, __dirname + `/../uploads/${req.params.path}/${req.params.id}/images`);
            //                }
        }else if (file.mimetype.includes("/webm") || file.mimetype.includes("/mp4")){
            log.info("req.params.path: " + req.params.path);
            log.info("Uploading webm file..")
            // PROD
            // if(process.env.PROD === "true"){
                
            //     cb(null, `/var/www/chatitapp.com/public/assets/uploads/${req.params.path}/${req.params.id}/images`);
            // }else{
            cb(null, __dirname + `/../uploads/${req.params.path}/${req.params.id}/webms`);
            //                }
        }else{
            cb("error", null);
        }

        log.info(req.params);
        //log.info(file);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });


module.exports = {
    upload,
}