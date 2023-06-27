const mongoose = require('mongoose');

//defaults means deletable or not
const eventsTypeSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true 
    },
    color: {
        type: String, 
        required: true 
    },
    tipology: {
        type: String, 
        required: true 
    },
    graph:{
        type: Boolean,
        require: true,
        default: true
    },
    defaults:{
        type: Boolean,
        require: true,
        default: false
    }
  }, { collection: 'events_type' });

module.exports = mongoose.model('EventsType', eventsTypeSchema);