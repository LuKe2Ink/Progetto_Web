const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const http = require('http');
const mongoose = require('mongoose');
const { isAuthenticated } = require('./router/authToken/tokenVerify')
const config = require("../config.json")

const io = require('socket.io')(3001, {
    cors: {
        orgin: ["http://localhost:8080"]
    }
})
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

io.on("connection", socket=>{
    console.log("hello stronzo")
    socket.on("notification", (user_id)=>{
        console.log(user_id)
    })

    let i = 0
    setInterval(()=>{
        socket.emit("notifications-get", "hello"+i)
        i++;
    }, 5000)
})

const server = http.createServer(app);
const port = 3000; 
server.listen(3000, () => {
  console.log('Server listening on port '+3000);
});

process.env.PWD = process.cwd()
app.use(express.static(process.env.PWD + '/public'));
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