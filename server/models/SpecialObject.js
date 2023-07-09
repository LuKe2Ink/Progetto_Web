const mongoose = require('mongoose');

const specialObjectSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true 
    },
    event_type: {
        type: String, 
        required: true 
    },
    date:{
        type: String, 
        required: true 
    },
    event_type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventsType",
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Events",
      required: true
    }
  }, { collection: 'special_object' });

module.exports = mongoose.model('SpecialObject', specialObjectSchema);