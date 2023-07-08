const History = require('../models/EventHistory');
const EventsType = require('../models/EventsType');
const Events = require('../models/Events');
const mongoose = require('mongoose')
const moment = require('moment'); 
const { json } = require('express');

//todo fare a tutti il controllo se è son settati tutti i dati del body
const historyAdd = async (req, res) => {
    delete req.body.__v;
    let data = req.body

    if((!data.event_type_id && data.event_type_id!='')
        || (!data.event_id && data.event_id!=''))
        return res.json({'status': 'ko',  'message': 'Prerequisited not valid'})
    const type = await EventsType.findById(data.event_type_id);
    if(!type)
        return res.json({'status': 'ko',  'message': 'The event type is not found' });
    const event = await Events.findById(data.event_id);
    const eventObjId = new mongoose.Types.ObjectId(data.event_id);
    if(!event)
        return res.json({'status': 'ko',  'message': 'The event is not found' });

    let jsonDuration = makeDurationJson(type, data)

    const historyIfExist = await History.find({
        event: eventObjId
    });
    if(historyIfExist.length > 0 && type.tipology == "normal"){
        historyIfExist[0].metadata = jsonDuration;
        historyIfExist[0].date = moment().format("DD/MM/YYYY HH:mm");
        await historyIfExist[0].save()
        // await historyIfExist.save();
    } else {
        const history = await History.create({
            metadata: jsonDuration,
            date: moment().format("DD/MM/YYYY HH:mm"),
            event: eventObjId
        })
    }

    res.json({'status': 'ok'});
}

// const historyModify = async (req, res) => {
//     let data = req.body;

//     if((!data.event_type_id && data.event_type_id!='')
//         || (!data.event_id && data.event_id!='') || (!data.history_id && data.history_id!=''))
//         return res.json({'status': 'ko', 'message': 'Prerequisited not valid'})
//     const type = await EventsType.findById(data.event_type_id);
//     if(!type)
//         return res.json({'status': 'ko', 'message': 'The event type is not found' });
//     const event = await EventsType.findById(data.event_id);
//     const eventObjId = new mongoose.Types.ObjectId(data.event_id);
//     if(!event)
//         return res.json({ 'status': 'ko', 'message': 'The event is not found' });
//     const history = await EventsType.findById(data.history_id);
//     const historyObjId = new mongoose.Types.ObjectId(data.history_id);
//     if(!history)
//         return res.json({ 'status': 'ko', 'message': 'The event is not found' });
      
//     let jsonDuration = makeDurationJson(type, data)
  
//     history.metadata = jsonDuration;
//     history.date = moment().format("DD/MM/YYYY HH:mm");
//     history.event = eventObjId;

//     await history.save();

//     res.json({ 'status': 'ok'});
// }

function makeDurationJson(type, data){
    let jsonDuration = {};
    if(type.tipology == "normal"){
        if(!data.duration) 
            return res.json({ 'status': 'ok', 
                'message': 'Prerequisited not valid',
                'problem' : 'duration'
            });
        jsonDuration = {
            duration: data.duration
        }
    } else {
        if(data.volume && data.volume>0)
            jsonDuration = {
                volume: data.volume
            }
        if(data.pages && data.pages>0)
            jsonDuration = {
                pages: data.pages
            }
        if(data.chapters && data.chapters>0)
            jsonDuration = {
                chapters: data.chapters
            }
        if(data.duration && data.duration>0)
            jsonDuration = {
                duration: data.seconds
            }
    }
    console.log(jsonDuration)
    return jsonDuration;
}

module.exports = {
    historyAdd
}