const Events = require('../models/Events');
const Users = require('../models/Users');
const mongoose = require('mongoose')
const moment = require('moment'); 
const EventsType = require('../models/EventsType');


//todo fare a tutti il controllo se è son settati tutti i dati del body
const eventsList = async (req, res) => {
  let data = req.body;
  
  if(!data.user_id)
    return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'})
    
  if(data.user_id == '')
      return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'})

  const user = await Users.findById(data.user_id);
  const objId = new mongoose.Types.ObjectId(data.user_id);
  if(!user)
    return res.json({'status': 'ko', 'message': 'The user is not found' });
  const events = await Events.aggregate([
    {$match: {user: objId}},
    {$lookup:{ 
      from: 'events_type', 
      localField:'event_type', 
      foreignField:'_id',
      as:'type'
    }},
    {$lookup:{ 
      from: 'special_object', 
      localField:'special_object', 
      foreignField:'_id',
      as:'special_object'
    }},
    {$unwind: '$type'},
    {$unwind: {
      path: "$special_object",
      "preserveNullAndEmptyArrays": true
    }},
  ]);
  res.json(events);
}

const eventCreate = async (req, res) => {
  let data = req.body;
  if(!data.title|| !data.date || !data.location || !data.description 
      || !data.event_type_id || !data.user_id)
      return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'})

  if(data.title == '' || data.date == '' || data.location == ''
      || data.description == '' || data.event_type_id == '' || data.user_id == '')
      return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'})

  const type = await EventsType.findById(data.event_type_id);
  const typeObjId = new mongoose.Types.ObjectId(data.event_type_id);
  if(!type)
    return res.json({ 'status': 'ko', 'message': 'The event type is not found' });  
  const user = await Users.findById(data.user_id);
  const userObjId = new mongoose.Types.ObjectId(data.user_id);
  if(!user)
    return res.json({'status': 'ko',  'message': 'The user is not found' });  
  const event = await Events.create({
    title: data.title,
    date: data.date,
    location: data.location,
    people: data.people,
    description: data.description,
    event_type: typeObjId,
    user: userObjId, 
    special_object: data.special_object ? data.special_object : null
  })

  let eventCreated = await getEventAggregate(event._id)

  res.json({'status': 'ok', 'data': eventCreated[0]});
}

const eventModify = async (req, res) => {
  delete req.body.__v;
  let data = req.body;
  if(!data.title|| !data.date || !data.location || !data.description 
        || !data.event_type_id || !data.event_id )
    return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'})

  if(data.title == '' || data.location == ''
    || data.description == '' || data.event_type_id == '' || data.event_id == '')
    return res.json({'status': 'ko', 'message': 'Prerequisited not valid'})

  const type = await EventsType.findById(data.event_type_id);
  const typeObjId = new mongoose.Types.ObjectId(data.event_type_id);
  if(!type)
    return res.json({ 'status': 'ko', 'message': 'The event type is not found' });

  let update = {
    title: data.title,
    date: data.date,
    location: data.location,
    people: data.people,
    description: data.description,
    event_type: typeObjId
  }
  if(data.finished_time)
    update["finished_time"] = data.finished_time

  let event = await Events.findOneAndUpdate({_id:data.event_id}, update)

  let eventModify = await getEventAggregate(event._id) 

  res.json({'status': 'ok', 'data': eventModify[0]});
}

const eventDelete = async (req, res) => {
  let data = req.body;
  if(data.event_id == '')
    return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'})
  if(!data.event_id)
    return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'})
  //todo delete eventDelete
  let event = await Events.findById(data.event_id)
  if(!event)
    return res.json({ 'status': 'ko', 'message': 'Event not found' });

  let eventDeleted = await Events.findByIdAndDelete(data.event_id)
  
  res.json({'status': 'ok', 'event': eventDeleted._id});
}

async function getEventAggregate(id){
  const event = await Events.aggregate([
    {$match: {_id: id}},
    {$lookup:
      { 
        from: 'events_type', 
        localField:'event_type', 
        foreignField:'_id',
        as:'type'
    }},
    {$lookup:
      {
        from: 'events_history', 
        localField:'_id', 
        foreignField:'event',
        as:'history'
      }
    },
    {$lookup:{ 
      from: 'special_object', 
      localField:'special_object', 
      foreignField:'_id',
      as:'special_object'
    }},
    {$unwind: '$type'},
    {$unwind: {
      path: "$history",
      "preserveNullAndEmptyArrays": true
    }},
    {$unwind: {
      path: "$special_object",
      "preserveNullAndEmptyArrays": true
    }},
  ]);
  return event
}

module.exports = {
    eventsList, 
    eventCreate,
    eventModify, 
    eventDelete
}