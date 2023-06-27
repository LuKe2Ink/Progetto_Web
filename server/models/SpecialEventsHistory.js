const mongoose = require('mongoose');

//duration in minutes
const specialEventsHistorySchema = new mongoose.Schema({
    metadata:{
        type: {
          chapter:{
            type: Number,
            require: false
          },
          volume:{
            type: Number,
            require: false
          },
          seconds:{
            type: Number,
            require: false 
          },
          page:{
            type: Number,
            require: false
        }
        },
        require: true
    },
    date: {
        type: String, 
        required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Events",
      required: true
    },
    events_type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EventsType",
      required: false
    }
  }, { collection: 'special_events_history' });

module.exports = mongoose.model('SpecialEventsHistory', specialEventsHistorySchema);