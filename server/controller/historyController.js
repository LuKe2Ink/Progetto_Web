const History = require('../models/EventHistory');
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

module.exports = {
    historyAdd, 
    historyModify
}