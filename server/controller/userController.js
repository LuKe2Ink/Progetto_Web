const User = require('../models/Users');
const Token = require('../models/Token');
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

  const refreshToken = jwt.sign({ username: req.body.username }, "refreshSecret");
  let token = await Token.create({
    type: "refreshToken",
    token: refreshToken,
    date: moment().format('DD/MM/YYYY HH:mm'),
    user: objId
  })

  res.status(200).send({user_id: user.id, refreshToken: refreshToken});
}

const usersList= async (req, res) => {
  //modify da fare
  let data = req.body
  let user = await checkPassword(data, res);
  if(user.status)
    return;
  console.log(user[0].role, user.role == 'admin')
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
    console.log(data.username)
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
  console.log(data.notification, (typeof data.notification)=='boolean', typeof null, typeof undefined)
  if((typeof data.notification)=='boolean'){
    setting["notification"] = data.notification
  }
  if(data.graph_setting && data.graph_setting != ''){
    setting["graph_setting"] = data.graph_setting
  }
  // console.log(setting)

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
  console.log(cryptedPass)
  await User.findByIdAndUpdate(objId, {password: cryptedPass})
  res.status(204).send({})
}

const userDelete = async (req, res) => {
  //lo faccio perché per eliminare richiede user e password
  let data = req.body
  const objId = new mongoose.Types.ObjectId(data.user_id);
  let findUser = await User.findById(objId)
  if(!findUser)
    return res.status(404).send({'message': 'Prerequisited not valid'});
  const oldUser = await checkPassword(data, res) 
  if(oldUser.status)
    return oldUser;
  const user = await User.findByIdAndDelete(objId)
  //eliminazione di anche tutti i dati
  res.status(204).send({})
}

const userLogin = async (req, res) => {
  let data = req.body

  let user = await checkPassword(data, res)
  if(user.status)
    return user;
  
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


async function checkPassword(data, res){
  if(!data || !data.username || !data.password)
    return res.status(412).send({'message': 'Prerequisited not valid'});

  if(data.username=='' || data.password=='')
    return res.status(412).send({'message': 'Prerequisited not valid'});

  const user = await User.aggregate([
    {$match: {username: data.username}},
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

  console.log(data.password, user[0].password)
  
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
    usersList
}