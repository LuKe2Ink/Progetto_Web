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
const moment = require('moment');
const axios = require('axios');
const fs = require('fs')
const path = require('path')
const dbpopolate = require('./utils/dbPopolate')

const popolateDb = async () => {
    try {
        await dbpopolate.makePopolation();
    } catch (error) {console.log("FAIL"+error)}
};

(async() => {
    await popolateDb();
})()

const fileIcs = fs.readFileSync(path.resolve(__dirname, 'Italy-Holidays.ics'), 'utf8')

function parseICS(icsString) {
    const lines = icsString.split('\n');
    const events = [];
    let event;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === 'BEGIN:VEVENT') {
            event = {};
        } else if (line === 'END:VEVENT') {
            events.push(event);
        } else if (event) {
            const match = /^([A-Z]+):(.*)$/.exec(line);
            if (match) {
                const [, key, value] = match;
                event[key] = value;
                }
        }
    }

    return events;
}

// date.nage
async function holidayList(){
    let holiday = await axios.get('https://date.nager.at/api/v3/publicholidays/'+moment().year()+'/IT')
    holiday = holiday.data
    holiday = holiday.filter((element)=>!element.fixed)
    return holiday;
}

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

async function createHolidayForUser(user_id){

    const holidaysApiList = await holidayList()

    const event_type = new mongoose.Types.ObjectId('649c6dada50adc1f49329171');
    const user = new mongoose.Types.ObjectId(user_id);

    let dateCheck = moment(holidaysApiList[0].date, 'YYYY-MM-DD')
    let dayCheck = dateCheck.get('D')
    let monthCheck = dateCheck.month()
    let yearCheck = dateCheck.year()

    const holidayCheck = await Events.find({
        "title": holidaysApiList[0].localName,
        "date.day":dayCheck,
        "date.month":monthCheck,
        "date.year":yearCheck,
        "holiday": true,
        "user": user
    })

    if(holidayCheck.length==0){
        holidaysApiList.forEach(async (element) => {
            let date = moment(element.date, 'YYYY-MM-DD')
            let day = date.get('D')
            let month = date.month()
            let year = date.year()

            const data = {
                day,
                month,
                year
            }

            const event = await Events.create({
                title: element.localName,
                date: data,
                location: '',
                people: '',
                description: element.localName,
                event_type: event_type,
                user: user, 
                special_object: null,
                holiday: true
            })
        });
    }

    let holidayIcs = parseICS(fileIcs)
    dateCheck = moment(holidayIcs[0].DTSTART, 'YYYYMMDD')
    dayCheck = dateCheck.get('D')
    monthCheck = dateCheck.month()
    yearCheck = moment().year()

    const holidayCheckIcs = await Events.find({
        "title": holidayIcs[0].SUMMARY,
        "date.day":dayCheck,
        "date.month":monthCheck,
        "date.year":yearCheck,
        "holiday": true,
        "user": user
    })

    if(holidayCheckIcs.length==0){
        holidayIcs.forEach(async (element)=>{
            let date = moment(element.DTSTART, 'YYYYMMDD')
            let day = date.get('D')
            let month = date.month()
            let year = moment().year()

            const data = {
                day,
                month,
                year
            }

            const event = await Events.create({
                title: element.SUMMARY,
                date: data,
                location: '',
                people: '',
                description: element.SUMMARY,
                event_type: event_type,
                user: user, 
                special_object: null,
                holiday: true
            })
        })
    }
}

let users_id = []
io.on("connection", socket=>{
    socket.on("notification", async (user_id)=>{
        if(!users_id.includes(user_id)){
            users_id.push(user_id)
            createHolidayForUser(user_id)
        }
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
                        {$match: {user: objId, holiday: {$ne:true} }},
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