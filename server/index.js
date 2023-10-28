const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors')
const http = require('http');
const mongoose = require('mongoose');
const { isAuthenticated } = require('./router/authToken/tokenVerify');
const config = require("../config.json");
const Events = require('./models/Events');
const Users = require('./models/Users');

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
            
        })
    } catch (e) {
        e => console.error('Error connecting to MongoDB:', e);
    }
}

// app.listen('3000', () => {
//   
// });
let users_id = []
io.on("connection", socket=>{
    socket.on("notification", (user_id)=>{
        if(!users_id.includes(user_id))
            users_id.push(user_id)
    })
    socket.on("disconnection", (user_id)=>{
        if(users_id.includes(user_id)){
            let index = users_id.indexOf(user_id);
            users_id.splice(index, 1)
        }
    })

    setInterval(async ()=>{
        if(users_id.length>0){
            users_id.forEach(async (element)=>{
                const objId = new mongoose.Types.ObjectId(element);
                let user = await Users.findById(objId)
                if(user.notification){
                    let event = await Events.aggregate([
                        {$match: {user: objId}},
                        {$lookup:
                        { 
                            from: 'events_type', 
                            localField:'event_type',
                            foreignField:'_id',
                            as:'type'
                        }},
                        {$lookup:
                        {
                            from: 'events_history', 
                            localField:'_id', 
                            foreignField:'event',
                            as:'history'
                        }
                        },
                        {$unwind: '$type'},
                        {$match: { "type.tipology": "normal" } },
                        {$unwind: {
                        path: "$history",
                        "preserveNullAndEmptyArrays": true
                        }},
                        {$match: { "history": {$exists: false} } },
                    ]);
                    socket.emit("notifications-"+element,event)
                }
            })
        }
    }, 60000)
})

const server = http.createServer(app);
const port = 3000; 
server.listen(3000, () => {
    
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


// 

module.exports = app;