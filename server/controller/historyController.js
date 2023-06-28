const History = require('../models/EventHistory');
const EventsType = require('../models/EventsType');
const mongoose = require('mongoose')
const moment = require('moment'); 
const { json } = require('express');

//todo fare a tutti il controllo se è son settati tutti i dati del body
const historyAdd = async (req, res) => {
    let data = req.body

    if((!data.event_type_id && data.event_type_id!='')
        || (!data.event_id && data.event_id!=''))
        return res.status(412).json({ 'message': 'Prerequisited not valid'})
    const type = await EventsType.findById(data.event_type_id);
    if(!type)
        return res.status(404).json({ 'message': 'The event type is not found' });
    const event = await EventsType.findById(data.event_id);
    const eventObjId = new mongoose.Types.ObjectId(data.event_id);
    if(!event)
        return res.status(404).json({ 'message': 'The event is not found' });
      
    let jsonDuration = makeDurationJson(type, data)
    
    const history = await History.create({
        metadata: jsonDuration,
        date: moment().format("DD/MM/YYYY HH:mm"),
        event: eventObjId
    })

    res.status(200).json({'status': 'ok'});
}

const historyModify = async (req, res) => {
    let data = res.body;

    if((!data.event_type_id && data.event_type_id!='')
        || (!data.event_id && data.event_id!='') || (!data.history_id && data.history_id!=''))
        return res.status(412).json({ 'message': 'Prerequisited not valid'})
    const type = await EventsType.findById(data.event_type_id);
    if(!type)
        return res.status(404).json({ 'message': 'The event type is not found' });
    const event = await EventsType.findById(data.event_id);
    const eventObjId = new mongoose.Types.ObjectId(data.event_id);
    if(!event)
        return res.status(404).json({ 'message': 'The event is not found' });
    const history = await EventsType.findById(data.history_id);
    const historyObjId = new mongoose.Types.ObjectId(data.history_id);
    if(!history)
        return res.status(404).json({ 'message': 'The event is not found' });
      
    let jsonDuration = makeDurationJson(type, data)
  
    history.metadata = jsonDuration;
    history.date = moment().format("DD/MM/YYYY HH:mm");
    history.event = eventObjId;

    await history.save();

    res.json();
}

function makeDurationJson(type, data){
    let jsonDuration = {};
    if(type.tipology == "normal"){
        if(!data.duration && data.event_type_id<=0) 
            return res.status(412).json({ 
                'message': 'Prerequisited not valid',
                'problem' : 'duration'
            });
        jsonDuration.metadata = {
            duration: data.duration
        }
    } else {
        if(data.volume && data.volume>0)
            jsonDuration.metadata["volume"] = data.volume
        if(data.pages && data.pages>0)
            jsonDuration.metadata["pages"] = data.pages
        if(data.chapters && data.chapters>0)
            jsonDuration.metadata["chapters"] = data.chapters
        if(data.seconds && data.seconds>0)
            jsonDuration.metadata["seconds"] = data.seconds
    }
    console.log(jsonDuration)
    return jsonDuration;
}

module.exports = {
    historyAdd, 
    historyModify
}