const mongoose = require('mongoose');

//duration in minutes
const eventsHistorySchema = new mongoose.Schema({
    metadata:{
      type: {
        chapter:{
          type: Number,
          require: false
        },
        page:{
          type: Number,
          require: false
        },
        episode:{
          type: Number,
          require: false
        },
        time: {
          type: Number, 
          required: false
        },
        duration: {
          type: Number, 
          required: false
        }
      },
      require: false
    },  
    date: {
        type: String, 
        required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Events",
      required: false
    },
    special_object: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SpecialObject",
      required: false
    }
  }, { collection: 'events_history' });

module.exports = mongoose.model('EventsHistory', eventsHistorySchema);