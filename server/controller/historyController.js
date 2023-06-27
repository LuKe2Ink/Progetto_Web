const History = require('../models/EventHistory');
const SpecialHistory = require('../models/SpecialEventsHistory');
const mongoose = require('mongoose')
const moment = require('moment') 

const historyAdd = async (req, res) => {
    //todo add attachmentAdd 
    res.json();
}

const historyModify = async (req, res) => {
  //todo delete attachmentDelete 
    res.json();
}

const specialHistoryAdd = async (req, res) => {
    //todo add attachmentAdd 
    res.json();
}

const specialHistoryModify = async (req, res) => {
  //todo delete attachmentDelete 
    res.json();
}

module.exports = {
    historyAdd, 
    historyModify,
    specialHistoryAdd,
    specialHistoryModify
}