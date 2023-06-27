const Events = require('../models/Events');
const mongoose = require('mongoose')
const moment = require('moment') 

const eventsList = async (req, res) => {
  //todo finish checks list eventsList 
  //get also information ov events_type
    const events = await Events.find({});
    res.json(events);
}

const eventSingle = async (req, res) => {
  //todo get a single event 
  res.json();
}

const eventCreate = async (req, res) => {
  //todo create eventCreate 
  const provaCreate = await Events.create({
    title: "Ciao bello di mamma",
    date: moment().format("DD/MM/YYYY HH:mm"),
    location: "Casa sua",
    people: ["Asdrubale", "Mariangiangiangela"],
    description: "Nonno laser",
    event_type: new mongoose.mongo.ObjectId(),
    user: new mongoose.mongo.ObjectId()
  })
  await provaCreate.save();
  //in body l'id dello user
  res.json(provaCreate);
}

const eventModify = async (req, res) => {
  //todo modify eventModify
  res.json();
}

const eventDelete = async (req, res) => {
  //todo delete eventDelete
  res.json();
}

module.exports = {
    eventsList, 
    eventCreate, 
    eventModify, 
    eventDelete
}