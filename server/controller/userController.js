const User = require('../models/Users');
const mongoose = require('mongoose')
const moment = require('moment') 

const userRegister = async (req, res) => {
    //todo register userRegister 
    res.json();
}

const userModify = async (req, res) => {
  //todo modify userModify 
    res.json();
}

const userDelete = async (req, res) => {
    //todo delete userDelete 
      res.json();
}

const userLogin = async (req, res) => {
    //todo login userLogin 
      res.json();
  }

module.exports = {
    userRegister, 
    userModify,
    userDelete,
    userLogin
}