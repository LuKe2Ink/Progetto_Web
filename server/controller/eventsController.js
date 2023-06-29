const Events = require('../models/Events');
const Users = require('../models/Users');
const mongoose = require('mongoose')
const moment = require('moment'); 
const EventsType = require('../models/EventsType');


//todo fare a tutti il controllo se è son settati tutti i dati del body
const eventsList = async (req, res) => {
  let data = req.body;
  const user = await Users.findById(data.user_id);
  const objId = new mongoose.Types.ObjectId(data.user_id);
  if(!user)
    return res.status(404).json({ 'message': 'The user is not found' });
  const events = await Events.aggregate([
    {$match: {user: objId}},
    {$lookup:{ 
      from: 'events_type', 
      localField:'event_type', 
      foreignField:'_id',
      as:'type'
    }},
    {$unwind: '$type'}
  ]);
  res.json(events);
}

const eventSingle = async (req, res) => {
    //todo prendere anche gli attachment

  //deve avere anche i type e dato che è singolo prendo anche la durata dell'evento
  //prendo anche se giustamente l'evento non è stato valorizzato con una durata
  let data = req.body;
  const objId = new mongoose.Types.ObjectId(data.event);
  const events = await Events.aggregate([
    {$match: {_id: objId}},
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
    {$unwind: '$type'},
    {$unwind: {
      path: "$history",
      "preserveNullAndEmptyArrays": true
    }},
  ]);
  if(events.length <= 0)
    return res.status(404).json({ 'message': 'Event not found' });
  res.json(events);
}

const eventCreate = async (req, res) => {
  let data = res.body;
  //412 precondition failed
  if(data.title == '' || data.date == '' || data.location == '' || data.people.length <= 0
      || data.description == '' || data.event_type_id == '' || data.user_id == '')
      return res.status(412).json({ 'message': 'Prerequisited not valid'})

  const type = await EventsType.findById(data.event_type_id);
  const typeObjId = new mongoose.Types.ObjectId(data.event_type_idvent);
  if(!type)
    return res.status(404).json({ 'message': 'The event type is not found' });  
  const user = await EventsType.findById(data.user_id);
  const userObjId = new mongoose.Types.ObjectId(data.event);
  if(!user)
    return res.status(404).json({ 'message': 'The user is not found' });  
  
  const event = await Events.create({
    title: data.title,
    date: data.date,
    location: data.location,
    people: data.people,
    description: data.description,
    event_type: typeObjId,
    user: userObjId
  })
  await event.save();
  res.json(event);
}

const eventModify = async (req, res) => {
  let data = res.body;
  //412 precondition failed
  if(data.title == '' || data.date == '' || data.location == '' || data.people.length <= 0
      || data.description == '' || data.event_type_id == '' || data.event_id == '')
      return res.status(412).json({ 'message': 'Prerequisited not valid'})

  const type = await EventsType.findById(data.event_type_id);
  const typeObjId = new mongoose.Types.ObjectId(data.eevent_type_idvent);
  if(!type)
    return res.status(404).json({ 'message': 'The event type is not found' });

  let event = await Events.findById(data.event_id)
  if(!event)
    return res.status(404).json({ 'message': 'Event not found' });
  event.title = data.tile;
  event.data = data.date;
  event.location = data.location;
  event.people = data.people;
  event.description = data.description;
  event.event_type = typeObjId;
  await event.save()

  res.status(200).json({'status': 'ok'});
}

const eventDelete = async (req, res) => {
  let data = res.body;
  if(data.event_id == '')
    return res.status(412).json({ 'message': 'Prerequisited not valid'})
  //todo delete eventDelete
  let event = await Events.findById(data.event_id)
  if(!event)
    return res.status(404).json({ 'message': 'Event not found' });

  let eventDeleted = await Events.findByIdAndDelete(data.event_id)
  
  res.status(200).json({'status': 'ok'});
}

module.exports = {
    eventsList, 
    eventSingle,
    eventCreate,
    eventModify, 
    eventDelete
}