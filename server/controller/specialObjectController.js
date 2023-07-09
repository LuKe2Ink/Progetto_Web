const SpecialObject = require('../models/SpecialObject');
const Users = require('../models/Users');
const mongoose = require('mongoose')
const moment = require('moment'); 
const { json } = require('express');

//todo fare a tutti il controllo se è son settati tutti i dati del body
const specialObjectList = async (req, res) => {
    let data = req.body

    if((!data.user_id && data.user_id!=''))
        return res.json({'status': 'ko',  'message': 'Prerequisited not valid'})
    
    const user = await Users.findById(data.user_id);
    const objId = new mongoose.Types.ObjectId(data.user_id);
    if(!user)
        return res.json({'status': 'ko', 'message': 'The user is not found' });
    
    const specialObjects = await SpecialObject.find({user: objId})

    res.json({'status': 'ok', 'data': specialObjects});
}

module.exports = {
    specialObjectList
}