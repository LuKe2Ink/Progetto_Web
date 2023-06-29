const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
    link: {
      type: String, 
      required: false 
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Events",
      required: true
    },
    file: {
      type: mongoose.Schema.Types.ObjectId,
      required: false
    },
    metadata:{
      type: {
        fileName:{
          type: String,
          require:false
        },
        date:{
          type: String,
          require:true
        },
        size:{
          type: Number,
          require:false
        }
        },
        require
    }
  }, { collection: 'attachment' });

module.exports = mongoose.model('Attachment', attachmentSchema);