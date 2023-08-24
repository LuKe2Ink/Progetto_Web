const mongoose = require('mongoose');

const specialObjectSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true 
    },
    date:{
        type: String, 
        required: true 
    },
    img: {
      type: String,
      required: true
    },
    event_type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventsType",
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true
    }
  }, { collection: 'special_object' });

module.exports = mongoose.model('SpecialObject', specialObjectSchema);