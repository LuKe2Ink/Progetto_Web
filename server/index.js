const express = require('express');
const app = express();
const cors = require('cors')
const http = require('http');
// const moment = require('moment');
app.use(cors());

const mongoose = require('mongoose');

const connectDB = () => {
    try {
        mongoose.connect('mongodb://127.0.0.1:27017/web_project')
        .then(() => {
            console.log('Connected to MongoDB');
        })
    } catch (e) {
        e => console.error('Error connecting to MongoDB:', e);
    }
}

app.listen('3000', () => {
  console.log('Node API server started on port ' + '3000');
});

const server = http.createServer(app);
const port = 8080; 
server.listen(port, () => {
  console.log('Server listening on port '+port);
});

app.use(express.json());
connectDB();

//all main routes
// app.use('/', require('./router/root'));
app.use('/events', require('./router/eventsRouter'));
app.use('/types', require('./router/eventsTypeRouter'));
app.use('/attachment', require('./router/attachmentRouter'));
app.use('/history', require('./router/historyRouter'));
app.use('/user', require('./router/userRouter')); 


console.log(app._router)

module.exports = app;