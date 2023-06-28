const Attachment = require('../models/Attachment');
const mongoose = require('mongoose')
const moment = require('moment') 

const attachmentAdd = async (req, res) => {
    let data = req.body
    //todo add attachmentAdd 
    res.json();
}

const attachmentDelete = async (req, res) => {
  //todo delete attachmentDelete 
    res.json();
}

module.exports = {
    attachmentDelete, 
    attachmentAdd
}