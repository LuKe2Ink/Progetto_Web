const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const http = require('http');
const mongoose = require('mongoose');
const { isAuthenticated } = require('./router/authToken/tokenVerify')
const config = require("../config.json")
// const moment = require('moment');
app.use(cors());

const connectDB = () => {
    try {
        mongoose.connect(config.mongoAddress+':'+config.mongoPort+'/'+config.mongoDb)
        .then(() => {
            console.log('Connected to MongoDB');
        })
    } catch (e) {
        e => console.error('Error connecting to MongoDB:', e);
    }
}

// app.listen('3000', () => {
//   console.log('Node API server started on port ' + '3000');
// });

const server = http.createServer(app);
const port = 3000; 
server.listen(3000, () => {
  console.log('Server listening on port '+3000);
});

// app.use(express.json());
// app.use(express.urlencoded({extended: true, limit: "100mb"}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
connectDB();

//all main routes
// app.use('/', require('./router/root'));
app.use('/events', isAuthenticated, require('./router/eventsRouter'));
app.use('/types', isAuthenticated, require('./router/eventsTypeRouter'));
app.use('/attachment', isAuthenticated, require('./router/attachmentRouter'));
app.use('/history', isAuthenticated, require('./router/historyRouter'));
app.use('/user', require('./router/userRouter')); 
app.use('/object', require('./router/specialObjectRouter'))


// console.log(app._router)

module.exports = app;