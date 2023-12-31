const History = require('../models/EventHistory');
const EventsType = require('../models/EventsType');
const Events = require('../models/Events');
const Users = require('../models/Users');
const SpecialObject = require('../models/SpecialObject')
const mongoose = require('mongoose')
const moment = require('moment'); 
const { json } = require('express');

//todo fare a tutti il controllo se è son settati tutti i dati del body
const historyAdd = async (req, res) => {
    let data = req.body

    if((!data.event_type_id && data.event_type_id!='')
        || (!data.event_id && data.event_id!='') || (!data.user_id && data.user_id!=''))
        return res.status(412).send({'message': 'Prerequisited not valid'});

    const user = await Users.findById(data.user_id);
    const objId = new mongoose.Types.ObjectId(data.user_id);
    if(!user)
        return res.status(404).send({'message': 'The user is not found' });

    const type = await EventsType.findById(data.event_type_id);
    if(!type)
        return res.status(404).send({'message': 'The event type is not found' });
    const event = await Events.findById(data.event_id);
    const eventObjId = new mongoose.Types.ObjectId(data.event_id);
    if(!event)
        return res.status(404).send({'message': 'The event is not found' });

    let jsonDuration = makeDurationJson(type, data)
    if(!jsonDuration.duration && !jsonDuration.time &&
        !jsonDuration.page && !jsonDuration.chapter && !jsonDuration.chapter)
        return res.status(412).send({ 'message': 'Campi non validi' });

    const historyIfExist = await History.find({
        event: eventObjId
    });
    let history;
    if(historyIfExist.length > 0 && type.tipology == "normal"){
        historyIfExist[0].metadata = jsonDuration;
        historyIfExist[0].date = moment().format("MM/DD/YYYY HH:mm");
        history = await historyIfExist[0].save()
        // await historyIfExist.save();
    } else {
        history = await History.create({
            metadata: jsonDuration,
            date: moment().format("MM/DD/YYYY HH:mm"),
            event: eventObjId,
            special_object: data.object_id ? data.object_id : null,
            user: data.user_id
        })
    }

    res.status(200).send(history);
}

const historyGet = async (req, res) => {
    let data = req.body
    
    // 

    if((!data.event_id && data.event_id!='') && (!data.special_object && data.special_object!=''))
        return res.status(412).send({'message': 'Prerequisited not valid'});
    
    
    let match = null;
    if(data.event_id){
        const event = await Events.findById(data.event_id);
        const objId = new mongoose.Types.ObjectId(data.event_id);
        if(!event)
            return res.status(404).send({'message': 'The event is not found' });
        match = {event: objId}
    }
    if(data.special_object){
        const object = await SpecialObject.findById(data.special_object);
        const objId = new mongoose.Types.ObjectId(data.special_object);
        if(!object)
            return res.status(404).send({'message': 'The special object is not found' }); 
        match = {special_object: objId}
    }

    const histories = await History.aggregate([
        {$match: match},
        {$addFields: {
            convertedDate: { $toDate: "$date" }
        }},
        {$sort: { "convertedDate": -1 }}
    ])
    res.status(200).send(histories);
}

const historyForGraph = async (req, res) => {
    let data = req.body
    if(!data.user_id)
        return res.status(412).send({'message': 'Prerequisited not valid'});
    
    if(data.user_id == '')
        return res.status(412).send({'message': 'Prerequisited not valid'});

    const user = await Users.findById(data.user_id);
    const objId = new mongoose.Types.ObjectId(data.user_id);
    if(!user)
        return res.status(404).send({'message': 'The user is not found' });
    
    const histories = await History.aggregate([
        {$match: {special_object: null, user: objId}},
        {$lookup:
            { 
                from: 'events', 
                localField:'event', 
                foreignField:'_id',
                as:'event'
            }},
        {$lookup:
            { 
                from: 'events_type', 
                localField:'event.event_type', 
                foreignField:'_id',
                as:'type'
            }
        },
    ]);
    
    res.status(200).send(histories);
}

function makeDurationJson(type, data){
    let jsonDuration = {};
    if(type.tipology == "normal"){
        if(!data.duration) 
            return res.status(412).send({
                'message': 'Prerequisited not valid',
                'problem' : 'duration'
            });
        jsonDuration = {
            duration: data.duration
        }
    } else {
        if(data.episode && data.episode>=1)  
            jsonDuration['episode']= data.episode
        if(data.page && data.page>0)
            jsonDuration['page']= data.page
        if(data.chapter && data.chapter>0)  
            jsonDuration['chapter']= data.chapter
        if(data.time && data.time>0)
            jsonDuration['time']= data.time
    }

    return jsonDuration;
}

module.exports = {
    historyAdd,
    historyGet,
    historyForGraph
}