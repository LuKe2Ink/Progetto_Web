const User = require('../models/Users');
const Token = require('../models/Token');
const Events = require('../models/Events');
const EventsType = require('../models/EventsType');
const SpecialObject = require('../models/SpecialObject');
const Attachment = require('../models/Attachment');
const History = require('../models/EventHistory');
const mongoose = require('mongoose')
const moment = require('moment') 
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const saltRounds = 10;

const tokenManager = require('../router/authToken/tokenVerify');

//vedere se utilizzare session token con refresh token
const userRegister = async (req, res) => {
  //todo controllo password(?)

  let data = req.body

  if(!data || !data.username || !data.password || !data.mail)
    return res.status(412).send({'message': 'Prerequisited not valid'});

  if(data.username=='' || data.password=='' || data.mail=='')
    return res.status(412).send({'message': 'Prerequisited not valid'});
    
  let salt = await bcrypt.genSalt(saltRounds);
  let cryptedPass = await bcrypt.hash(data.password, salt);

  let findUsername = await User.find({
    username: data.username
  })
  if(findUsername.length > 0)
    return res.status(422).send({'message': 'Username already existing'});
  let findMail = await User.find({
    mail: data.mail
  })
  if(findMail.length > 0)
    return res.status(422).send({'message': 'Mail already existing'});

  const user = await User.create({
    username: data.username,
    password: cryptedPass,
    mail: data.mail,
    creation: moment().format('DD/MM/YYYY HH:mm')
  })

  const objId = new mongoose.Types.ObjectId(user._id);

  const refreshToken = jwt.sign({ username: req.body.username }, "refreshSecret");
  let token = await Token.create({
    type: "refreshToken",
    token: refreshToken,
    date: moment().format('DD/MM/YYYY HH:mm'),
    user: objId
  })

  res.status(200).send();
}

const usersList= async (req, res) => {
  //modify da fare
  let data = req.body
  let user = await checkPassword(data, res);
  if(user.status)
    return user;
  if(user[0].role == 'admin'){
    const users = await User.find();
    return res.status(200).send(users);
  } else {
    return res.status(401).send({'status': 'ko',  'message': 'Accesso non autorizzato'});
  }
}

const userModify = async (req, res) => {
  //modify da fare
  let data = req.body
  if(!data || !data.user_id)
    return res.status(412).send({'message': 'Prerequisited not valid'});

  if(data.user_id=='')
    return res.status(412).send({'message': 'Prerequisited not valid'});

  const objId = new mongoose.Types.ObjectId(data.user_id);
  let oldUser = await User.findById(objId)
  if(!oldUser)
    return res.status(404).send({'message': 'Prerequisited not valid'});

  let setting = {}
  if(data.username && data.username != ''){
    let findUsername = await User.find({
      username: data.username
    })
    if(findUsername.length > 0)
      return res.status(422).send({'message': 'Username already existing'});
    setting["username"] = data.username
  }
  if(data.mail && data.mail != ''){
    let findMail = await User.find({
      mail: data.mail
    })
    if(findMail.length > 0)
      return res.status(422).send({'message': 'Mail already existing'});
    setting["mail"] = data.mail
  }
  if((typeof data.notification)=='boolean'){
    setting["notification"] = data.notification
  }
  if(data.graph_setting && data.graph_setting != ''){
    setting["graph_setting"] = data.graph_setting
  }

  await User.findByIdAndUpdate(objId, setting)
  const user = await User.findById(objId);

  res.status(200).send({user})
}

const userChangePassword = async (req, res) => {
  //lo faccio perché per eliminare richiede user e password
  let data = req.body
  if(!data.newPassword || data.newPassword == '')
    return res.status(412).send({'message': 'Prerequisited not valid'});

  const objId = new mongoose.Types.ObjectId(data.user_id);
  let findUser = await User.findById(objId)
  if(!findUser)
    return res.status(404).send({'message': 'Prerequisited not valid'});

  const oldUser = await checkPassword(data, res)
  if(oldUser.status)
    return oldUser;
  let salt = await bcrypt.genSalt(saltRounds);
  let cryptedPass = await bcrypt.hash(data.newPassword, salt);
  await User.findByIdAndUpdate(objId, {password: cryptedPass})
  res.status(204).send({})
}

const userDelete = async (req, res) => {
  //lo faccio perché per eliminare richiede user e password
  let data = req.body
  console.log(data)
  const objId = new mongoose.Types.ObjectId(data.user_id);
  let findUser = await User.findById(objId)
  if(!findUser)
    return res.status(412).send({'message': 'Prerequisited not valid'});
  const oldUser = await checkPassword(data, res) 
  if(oldUser.status)
    return oldUser;
  const user = await User.findByIdAndDelete(objId)

  //events, history con event, attachment con event 
  let events = await Events.find({user: data.user_id});
  console.log("Eventi: "+events.length)
  if(events){
    let events_id=[]
    for (let index = 0; index < events.length; index++) {
        const element = events[index];
        await Events.findByIdAndDelete(element._id)
        events_id.push(element._id)
    }
    for (let index = 0; index < events_id.length; index++) {
        let event_history = await History.find({event: events_id[index]});
        console.log("History: "+event_history.length)
        let events_attachment = await Attachment.find({event: events_id[index]});
        console.log("Attachment: "+events_attachment.length)
        for (let index = 0; index < event_history.length; index++) {
            const element = event_history[index];
            await History.findByIdAndDelete(element._id)
        }
        for (let index = 0; index < events_attachment.length; index++) {
          const element = events_attachment[index];
          await Attachment.findByIdAndDelete(element._id)
      }
    }
  }
  //event_type
  let event_types = await EventsType.find({user: data.user_id});
  console.log("EventsType: "+event_types.length)
  if(event_types){
    for (let index = 0; index < event_types.length; index++) {
        const element = event_types[index];
        await EventsType.findByIdAndDelete(element._id)
    }
  }
  //special_objects
  let special_objects = await SpecialObject.find({user: data.user_id});
  console.log("SpecialObject: "+special_objects.length)
  if(special_objects){
    //event_type
    for (let index = 0; index < special_objects.length; index++) {
        const element = special_objects[index];
        await SpecialObject.findByIdAndDelete(element._id)
    }
  }

  let token = await Token.find({user: data.user_id});
  console.log("Token: "+token.length)
  if(token){
    //event_type
    for (let index = 0; index < token.length; index++) {
        const element = token[index];
        await Token.findByIdAndDelete(element._id)
    }
  }
  //eliminazione di anche tutti i dati
  res.status(204).send({})
}

const userLogin = async (req, res) => {
  let data = req.body

  let user = await checkPassword(data, res)
  if(user.status){
    return user;
  }

  user = user[0]
  
  let accessToken;
  let token = await Token.findOne({user: user._id})
  accessToken = tokenManager.createNewToken(req.body.username, token.token)

  res.status(200).send({ 
    accessToken: accessToken,
    user_id: user._id,
  });
}

const userVerifyOrRefresh = async (req, res) => {
  let data = req.body

  if(!data.token || data.token == ''){
    return res.status(412).send({'message': 'Prerequisited not valid'});
  }

  let accessToken = data.token;
  if(!tokenManager.isExpired(data.token)){
    let token = await Token.findOne({user: data.user_id})
    accessToken = tokenManager.createNewToken(req.body.username, token.token)
  }

  res.status(200).send({ 
    accessToken: accessToken,
    user_id: data.user_id
  });
}

const userSettings = async (req, res) => {
  let data = req.body

  if(!data.user_id || data.user_id == ''){
    return res.status(412).send({'message': 'Prerequisited not valid'});
  }
  const objId = new mongoose.Types.ObjectId(data.user_id);

  let user = await User.findOne({_id:objId})
  if(!user)
    return res.status(404).send({'message': 'Prerequisited not valid'});

  res.status(200).send(user);
}

const disableEnableUser = async (req, res) => {
  let data = req.body

  if(!data.user_id || data.user_id == ''){
    return res.status(412).send({'message': 'Prerequisited not valid'});
  }
  const objId = new mongoose.Types.ObjectId(data.user_id);

  let user = await User.findOne({_id:objId})
  if(!user)
    return res.status(404).send({'message': 'Prerequisited not valid'});

  await User.findByIdAndUpdate(objId, {active: !user.active})

  res.status(204).send();
}


async function checkPassword(data, res){
  if(!data || !data.username || !data.password)
    return res.status(412).send({'message': 'Prerequisited not valid'});

  if(data.username=='' || data.password=='')
    return res.status(412).send({'message': 'Prerequisited not valid'});

  const user = await User.aggregate([
    {$match: {username: data.username, active: true}},
    {$lookup:
      {
        from: 'tokens', 
        localField:'_id', 
        foreignField:'user',
        as:'token'
      }
    },
    {$unwind: {
      path: "$token",
      "preserveNullAndEmptyArrays": true
    }},
  ]);
  if(user.length <= 0)
    return res.status(404).send({'message': 'User not found'});
  
  let compare = await bcrypt.compare(data.password, user[0].password)
  if(!compare){
    return res.status(412).send({'message':'Password or username not corret' });
  }
  return user;
}

module.exports = {
    userRegister, 
    userModify,
    userDelete,
    userLogin,
    userVerifyOrRefresh,
    userSettings,
    userChangePassword,
    usersList,
    disableEnableUser
}