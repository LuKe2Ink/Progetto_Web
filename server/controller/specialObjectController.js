const SpecialObject = require('../models/SpecialObject');
const Users = require('../models/Users');
const EventsType = require('../models/EventsType');
const Events = require('../models/Events');
const History = require('../models/EventHistory');
const mongoose = require('mongoose')
const moment = require('moment'); 
const { json } = require('express');

//todo fare a tutti il controllo se è son settati tutti i dati del body
const specialObjectList = async (req, res) => {
    let data = req.body

    if((!data.user_id && data.user_id!=''))
        return res.status(412).send({'message': 'Prerequisited not valid'});
    
    const user = await Users.findById(data.user_id);
    const objId = new mongoose.Types.ObjectId(data.user_id);
    if(!user)
        return res.status(404).send({'message': 'The user is not found' });
    
    const specialObjects = await SpecialObject.find({user: objId})

    res.status(200).send(specialObjects);
}

const specialObjectAdd = async (req, res) => {
    let data = req.body

    if((!data.user_id && data.user_id!=''))
        return res.status(412).send({'message': 'Prerequisited not valid'});
    
    if(!data.name|| !data.event_type_id || !data.img )
        return res.status(412).send({'message': 'Prerequisited not valid'});

    if(data.name == '' || data.event_type_id == '' || data.img == '')
        return res.status(412).send({'message': 'Prerequisited not valid'});

    const user = await Users.findById(data.user_id);
    const userId = new mongoose.Types.ObjectId(data.user_id);
    if(!user)
        return res.status(404).send({'message': 'The user is not found' });
    
    // const specialObjects = await SpecialObject.find({user: objId})
    const specialObject = await SpecialObject.create({
        name: data.name,
        img: data.img,
        date: moment().format("DD/MM/YYYY HH:mm"),
        event_type: data.event_type_id,
        user: userId
    })

    res.status(200).send(specialObject);
}

const specialObjectModify = async (req, res) => {
    delete req.body.__v;
    let data = req.body;
    if(!data.name|| !data.event_type_id || !data.object_id )
        return res.status(412).send({'message': 'Prerequisited not valid'});

    if(data.name == '' || data.event_type_id == '' || data.object_id == '')
        return res.status(412).send({'message': 'Prerequisited not valid'});

    const type = await EventsType.findById(data.event_type_id);
    if(!type)
        return res.status(404).send({ 'status': 'ko', 'message': 'The event type is not found' });

    let update = {
        name: data.name
    }
    if(data.img != '')
        update.img = data.img

    let specialObject = await SpecialObject.findOneAndUpdate({_id: data.object_id}, update)
    const objId = new mongoose.Types.ObjectId(data.object_id);
    specialObject = await SpecialObject.findById(objId)

    res.status(200).send(specialObject);
}

const specialObjectDelete = async (req, res) => {
    let data = req.body;
    if(data.object_id == '')
        return res.status(412).send({'message': 'Prerequisited not valid'});
    if(!data.object_id)
        return res.status(412).send({'message': 'Prerequisited not valid'});

    let object = await SpecialObject.findById(data.object_id)
    if(!object)
        return res.status(404).send({ 'status': 'ko', 'message': 'Event not found' });

    let objectDeleted = await SpecialObject.findByIdAndDelete(data.object_id)
    if(data.chain_events){
        let events = await Events.find({special_object: data.object_id});
        let histories = await History.find({special_object: data.object_id});
        if(events){
            let events_id=[]
            //events
            for (let index = 0; index < events.length; index++) {
                const element = events[index];
                await Events.findByIdAndDelete(element._id)
                events_id.push(element._id)
            }
            //history
            for (let index = 0; index < histories.length; index++) {
                const element = histories[index];
                await History.findByIdAndDelete(element._id)
                events_id.push(element._id)
            }
            for (let index = 0; index < events_id.length; index++) {
                let event_history = await History.find({event: events_id[index]});
                for (let index = 0; index < event_history.length; index++) {
                    const element = event_history[index];
                    await History.findByIdAndDelete(element._id)
                    events_id.push(element._id)
                }
            }
        }
    }

    res.status(200).send(objectDeleted._id);
}

module.exports = {
    specialObjectList,
    specialObjectAdd,
    specialObjectModify,
    specialObjectDelete
}