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
    role:{
        type: String,
        require: false,
        default: 'user'
    },
    notification:{
        type: Boolean,
        require: false,
        default: true
    },
    graph_setting:{
        type: String,
        require: false,
        default: 'minutes'
    },
    
  }, { collection: 'users' });

module.exports = mongoose.model('Users', userSchema);