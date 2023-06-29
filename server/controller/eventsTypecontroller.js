const EventsType = require('../models/EventsType');
const mongoose = require('mongoose')
const moment = require('moment') 

const eventsTypeList = async (req, res) => {
  let data = req.body
  if(!data || !data.user_id)
    return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'});

  if(data.user_id=='')
    return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'});
  
  const typesDefault = await EventsType.find({defaults: true});
  // console.log(typesDefault)
  const objId = new mongoose.Types.ObjectId(data.user_id);
  const userTypes = await EventsType.find({user: objId})
  let eventsType = typesDefault.concat(userTypes)
  res.json(eventsType);
}

const eventsTypeCreate = async (req, res) => {
  let data = req.body
  if(!data || !data.user_id || !data.name || !data.color 
      || !data.tipology || !data.graph)
    return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'});

  if(data.user_id==''|| data.name=='' || data.color=='' || data.tipology=='')
    return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'});

  const type = await EventsType.create({
    name: data.name,
    color: data.color,
    tipology: data.tipology,
    user: new mongoose.mongo.ObjectId(data.user_id)
  })
  
  res.json(type);
}

const eventsTypeModify = async (req, res) => {
  let data = req.body
  if(!data || !data.name || !data.color 
      || !data.tipology || !data.graph || !data.type_id)
    return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'});

  if(data.name=='' || data.color=='' || data.tipology=='' || data.type_id=='')
    return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'});

  let objId = new mongoose.mongo.ObjectId(data.type_id)
  const type = await EventsType.findById(objId)
  if(!type)
    return res.json({ 'status': 'ko', 'message': 'Event type not found'});
  
  type.name = data.name
  type.color = data.color
  type.tipology = data.tipology
  await type.save();
  
  res.json({'status': 'ok'});
}

const eventsTypeDelete = async (req, res) => {
  let data = req.body
  if(!data.type_id)
    return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'});

  if(data.type_id=='')
    return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'});

  let objId = new mongoose.mongo.ObjectId(data.type_id)
  const type = await EventsType.findByIdAndDelete(objId)
  
  res.json({'status': 'ok', 'type': type._id});
}

module.exports = {
    eventsTypeList, 
    eventsTypeCreate, 
    eventsTypeModify, 
    eventsTypeDelete
}