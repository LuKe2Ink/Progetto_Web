const EventsType = require('../models/EventsType');
const mongoose = require('mongoose')
const moment = require('moment') 

const eventsTypeList = async (req, res) => {
  //todo finish checks list eventsTypeList 
    const events = await EventsType.find({});
    res.json(events);
}

const eventsTypeCreate = async (req, res) => {
  //todo create eventsTypeCreate 
  res.json();
}

const eventsTypeModify = async (req, res) => {
  //todo modify eventsTypeModify
  res.json();
}

const eventsTypeDelete = async (req, res) => {
  //todo delete eventsTypeDelete
  res.json();
}

module.exports = {
    eventsTypeList, 
    eventsTypeCreate, 
    eventsTypeModify, 
    eventsTypeDelete
}