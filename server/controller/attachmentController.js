const Attachment = require('../models/Attachment');
const mongoose = require('mongoose')
const moment = require('moment') 

const attachmentAdd = async (req, res) => {
    let data = req.body
    if(!data.event_id)
        return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'});

    if(data.event_id=='')
        return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'});
    
    const objId =new mongoose.mongo.ObjectId(data.event_id);

    let jsonAdd = {event: objId};
    if(!data.link && data.link==''){
        jsonAdd["link"] = data.link;
        jsonAdd["metadata"] = {
            date: moment().format("DD/MM/YYYY HH:mm")
        } 
    } else if(!data.file && data.file==''){
        //creazione del file tramite gridfs
        //sostituire il data.file con l'id successivamente
        const objId =new mongoose.mongo.ObjectId(data.file);
        jsonAdd["file"] = objId;
        jsonAdd["metadata"] = {
            fileName: "nomefile.ciao" ,
            date: moment().format("DD/MM/YYYY HH:mm"),
            size: 100000
        } 
    } else {
        return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'});
    }

    const attachment = await Attachment.create({jsonAdd});

    res.json(attachment.metadata);
}

const attachmentDelete = async (req, res) => {
  //todo delete attachmentDelete 
    let data = req.body
    if(!data.attacment_id)
        return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'});

    if(data.attacment_id=='')
        return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'});
    
    const objId =new mongoose.mongo.ObjectId(data.attacment_id);
    const attachment = await Attachment.findByIdAndDelete(objId)
    
    res.json({'status': 'ok', 'user': attachment._id})
}

module.exports = {
    attachmentDelete, 
    attachmentAdd
}