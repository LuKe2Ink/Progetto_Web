const mongoose = require('mongoose');

//duration in minutes
const eventsHistorySchema = new mongoose.Schema({
    duration: {
        type: Number, 
        required: false
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
  }, { collection: 'events_history' });

module.exports = mongoose.model('EventsHistory', eventsHistorySchema);