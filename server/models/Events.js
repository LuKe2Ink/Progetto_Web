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
      },
      time: {
        type: String,
        require: true
      },
      finished_time: {
        type: String,
        require: false
      }
    },
    people: {
      type: [{type: String }],
      required: false
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