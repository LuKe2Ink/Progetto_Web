const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    type: {
        type: String, 
        required: true 
    },
    token: {
        type: String, 
        required: true 
    },
    date:{
        type: String, 
        required: true 
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true
    }
  }, { collection: 'tokens' });

module.exports = mongoose.model('Tokens', tokenSchema);