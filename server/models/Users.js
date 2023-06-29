const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: true 
    },
    password: {
        type: String, 
        required: true 
    },
    mail: {
        type: String, 
        required: true 
    },
    creation:{
        type: String, 
        required: true 
    },
    active:{
        type: Boolean,
        require: false,
        default: true
    },
    
  }, { collection: 'users' });

module.exports = mongoose.model('Users', userSchema);