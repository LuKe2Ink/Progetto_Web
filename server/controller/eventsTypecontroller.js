const EventsType = require('../models/EventsType');
const History = require('../models/EventHistory');
const Events = require('../models/Events');
const mongoose = require('mongoose')
const moment = require('moment') 

const eventsTypeListFiltered = async (req, res) => {
  let data = req.body
  if(!data || !data.user_id)
    return res.status(412).send({'message': 'Prerequisited not valid'});;

  if(data.user_id=='')
    return res.status(412).send({'message': 'Prerequisited not valid'});;
  
  let tipology = "normal";
    
  if(data.special && data.special == true)
    tipology = 'special'

  const typesDefault = await EventsType.find({defaults: true, tipology: tipology});
  // console.log(typesDefault)
  const objId = new mongoose.Types.ObjectId(data.user_id);
  const userTypes = await EventsType.find({user: objId, tipology: tipology})
  let eventsType = typesDefault.concat(userTypes)
  res.status(200).send(eventsType);
}

const eventsTypeList = async (req, res) => {
  let data = req.body
  if(!data || !data.user_id)
    return res.status(412).send({'message': 'Prerequisited not valid'});;

  if(data.user_id=='')
    return res.status(412).send({'message': 'Prerequisited not valid'});;

  const typesDefault = await EventsType.find({defaults: true});
  // console.log(typesDefault)
  const objId = new mongoose.Types.ObjectId(data.user_id);
  const userTypes = await EventsType.find({user: objId})
  let eventsType = typesDefault.concat(userTypes)
  res.status(200).send(eventsType);
}

const eventsTypeCreate = async (req, res) => {
  let data = req.body
  if(!data || !data.user_id || !data.name || !data.color 
    || (data.graph==null || data.graph==undefined))
    return res.status(412).send({'message': 'Prerequisited not valid'});;

  if(data.user_id==''|| data.name=='' || data.color=='')
    return res.status(412).send({'message': 'Prerequisited not valid'});;

  const type = await EventsType.create({
    name: data.name,
    color: data.color,
    tipology: 'normal',
    graph: data.graph,
    default: false,
    user: new mongoose.mongo.ObjectId(data.user_id)
  })
  
  res.status(200).send(type);
}

const eventsTypeModify = async (req, res) => {
  let data = req.body
  if(!data || !data.name || !data.color 
      || !data.tipology || (data.graph == null || data.graph == undefined) 
      || !data.type_id)
    return res.status(412).send({'message': 'Prerequisited not valid'});;

  if(data.name=='' || data.color=='' || data.tipology=='' || data.type_id=='')
    return res.status(412).send({'message': 'Prerequisited not valid'});;

  let objId = new mongoose.mongo.ObjectId(data.type_id)
  const type = await EventsType.findById(objId)
  if(!type)
    return res.status(404).send({'message': 'Event type not found'});
  
  type.name = data.name
  type.color = data.color
  type.tipology = data.tipology
  type.graph = data.graph

  let modifiedType = await type.save();
  
  res.status(200).send(modifiedType);
}

const eventsTypeDelete = async (req, res) => {
  let data = req.body
  if(!data.type_id)
    return res.status(412).send({'message': 'Prerequisited not valid'});;

  if(data.type_id=='')
    return res.status(412).send({'message': 'Prerequisited not valid'});;

  let objId = new mongoose.mongo.ObjectId(data.type_id)
  const type = await EventsType.findByIdAndDelete(objId)
  if(data.chain_events){
    let events = await Events.find({event_type: data.type_id});
    if(events){
        let events_id=[]
        //events
        for (let index = 0; index < events.length; index++) {
            const element = events[index];
            await Events.findByIdAndDelete(element._id)
            events_id.push(element._id)
        }
        //attached histories to events
        for (let index = 0; index < events_id.length; index++) {
            let event_history = await History.find({event: events_id[index]});
            console.log(events_id[index], event_history)
            for (let index = 0; index < event_history.length; index++) {
                const element = event_history[index];
                await History.findByIdAndDelete(element._id)
            }
        }
    }
  }
  const typeId = type._id
  res.status(200).send(typeId);
}

module.exports = {
    eventsTypeList, 
    eventsTypeListFiltered,
    eventsTypeCreate, 
    eventsTypeModify, 
    eventsTypeDelete
}