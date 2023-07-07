const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true 
    },
    description: {
        type: String, 
        required: true 
    },
    location: {
        type: String, 
        required: false 
    },
    date: {
      day: {
        type: Number, 
        required: true
      },
      month: {
        type: Number, 
        required: true
      },
      year: {
        type: Number, 
        required: true
      } 
    },
    people: {
      type: [{type: String }],
      required: false
    },
    finished: {
      type: Boolean,
      require: true,
      defaults: false
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
  }, { collection: 'events' });

module.exports = mongoose.model('Events', eventSchema);