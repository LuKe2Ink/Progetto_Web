const mongoose = require('mongoose');
const { promisify } = require('util');
const Users = require('../models/Users');
const EventsType = require('../models/EventsType');
const SpecialObject = require('../models/SpecialObject');
const Token = require('../models/Token');
const path = require('path')
const fs = require('fs')

const readFileAsync = promisify(fs.readFile);

const makePopolation = async () => {
    try {
        await checkCollection('users', Users);
    } catch (error) {
        console.log(error)
    }
    try {
        await checkCollection('tokens', Token);
    } catch (error) {
        console.log(error)}
    try {
        await checkCollection('event_types', EventsType);
    } catch (error) {
        console.log(error)}
    try { 
        await checkCollection('special_objects', SpecialObject);
    } catch (error) {
        console.log(error)}
}

const checkCollection = async (filename, Model) => {
    try {
        const dataPath = path.join(__dirname, `${filename}.json`);
        const data = await readFileAsync(dataPath, 'utf8');
        let datas = JSON.parse(data);

        const count = await Model.countDocuments();

        datas.map(element => {
            if(element.user)
                element.user = new mongoose.mongo.ObjectId(element.user)
            if(element._id)
                element._id = new mongoose.mongo.ObjectId(element._id)
            if(element.event_type)
                element.event_type = new mongoose.mongo.ObjectId(element.event_type)
        });

        if (count === 0) {
            await Model.insertMany(datas);
        } else {
            throw new Error('Dati esistenti');
        }
    } catch (error) {;
        throw error;
    }
};

module.exports = {
    makePopolation
}