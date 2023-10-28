const Attachment = require('../models/Attachment');
const Events = require('../models/Events');
const mongoose = require('mongoose')
const moment = require('moment') 

const attachmentAdd = async (req, res) => {
    let data = req.body
    if(!data.event_id)
        return res.status(412).send({'message': 'Prerequisited not valid'});;

    if(data.event_id=='')
        return res.status(412).send({'message': 'Prerequisited not valid'});;
    
    const objId = new mongoose.mongo.ObjectId(data.event_id);
    
    let attachment = [];

    let jsonAdd = {event: objId};
    if(data.link && data.link!=''){
        let existingLink = await Attachment.findOne({event: objId, link:{$exists: 1}})
        jsonAdd["link"] = data.link;
        jsonAdd["metadata"] = {
            date: moment().format("DD/MM/YYYY HH:mm")
        }
        let att = null; 
        if(existingLink){
            await Attachment.findOneAndUpdate({_id: existingLink._id},jsonAdd);
            att = await Attachment.findOne({event:objId, link:{$exists: 1}})
        }
        else
            att = await Attachment.create(jsonAdd);
        attachment.push(att)
    }
    jsonAdd = {event: objId}
    if(data.file && data.file!=''){
        let existingLink = await Attachment.findOne({event: objId, file:{$exists: 1}})
        jsonAdd["file"] = data.file;
        jsonAdd["metadata"] = {
            fileName: data.fileName,
            date: moment().format("DD/MM/YYYY HH:mm"),
            size: data.size
        }
        
        let att = null; 
        if(existingLink){
            await Attachment.findOneAndUpdate({_id: existingLink._id},jsonAdd);
            att = await Attachment.findOne({event:objId, file:{$exists: 1}})
        }
        else
            att = await Attachment.create(jsonAdd);
        attachment.push(att)
    }
    if(attachment.length == 0){
        return res.status(412).send({'message': 'Prerequisited not valid'});;
    }

    

    res.status(200).send({'data': attachment});
}

const attachmentDelete = async (req, res) => {
  //todo delete attachmentDelete 
    let data = req.body
    if(!data.attachment_id)
        return res.status(412).send({'message': 'Prerequisited not valid'});;

    if(data.attachment_id=='')
        return res.status(412).send({'message': 'Prerequisited not valid'});;
    
    const attachment = await Attachment.findByIdAndDelete(data.attachment_id)
    
    res.status(200).send(attachment)
}

module.exports = {
    attachmentDelete, 
    attachmentAdd
}