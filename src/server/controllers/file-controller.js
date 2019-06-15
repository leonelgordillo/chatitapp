const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const uploadService = require('../services/upload-service.js');
const upload = uploadService.upload;
var uploadFile = upload.single('file');
const log = require('../config.js').log();

module.exports = {
    uploadMedia,
    retrieveMedia,
}

function uploadMedia(req, res, next){

    uploadFile(req,res, function(err){
        if(err){
            log.error("Error uploading: Invalid file type");
            res.status(200).json({ 'success': false, error: 'Invalid file type.'});
            return;
        }else{
            // TODO: Update user in DB to count how many MBs have been uploaded            
            var mediaRef, mediaType;

            if(req.params.path === "rooms"){

                if(req.file.mimetype.includes("image/")){
                    mediaRef = `${req.params.path}/${req.params.id}/images/${req.file.filename}`;
                    mediaType = "image"
                    log.info("Setting mediaRef to: " + mediaRef);
                }
                else if(req.file.mimetype.includes("/webm")){
                    mediaRef = `${req.params.path}/${req.params.id}/webms/${req.file.filename}`;
                    mediaType = "webm"
                    log.info("Setting mediaRef to: " + mediaRef);
                }
                else if(req.file.mimetype.includes("/mp4")){
                    mediaRef = `${req.params.path}/${req.params.id}/webms/${req.file.filename}`;
                    mediaType = "mp4"
                    log.info("Setting mediaRef to: " + mediaRef);
                }else{

                }
                // switch (req.params.type) {
                //     case "image":
                //         imgRef = `${req.params.path}/${req.params.id}/images/${req.file.filename}`
                //         break;
                //     case "webm":
                //         imgRef = `${req.params.path}/${req.params.id}/webms/${req.file.filename}`
                //     default:
                //         break;
                // }
            }else if (req.params.path === "profiles"){
                User.findOneAndUpdate(
                    {username: req.params.id},
                    {$set: {
                        'profileImgRef':mediaRef
                    }}
                    )
            }
            
            log.info("Responding to /upload POST request");

        res.status(200).json({ 'success': true, 'message': 'File uploaded successfully!', ref: mediaRef, type: mediaType });
        }
    });

}

function retrieveMedia(req, res){

    // console.log("Params: " + req.params.path);
    // console.log("Params[0]" + req.params[0]);
    let imagePath = __dirname + `/../uploads/${req.params.path}${req.params[0]}`;
    if (fs.existsSync(path.resolve(imagePath))) {
        res.sendFile((path.resolve(imagePath)))
    }
    // if (req.params.roomID === "rooms") {
    // }
    // else {
    //     res.sendFile(__dirname + `/uploads/rooms/${req.params.roomID}/images/${req.params.name}`)
    // }
}