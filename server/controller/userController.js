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
    return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'});

  if(data.username=='' || data.password=='' || data.mail=='')
    return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'});
    
  let salt = await bcrypt.genSalt(saltRounds);
  let cryptedPass = await bcrypt.hash(data.password, salt);

  let findUsername = await User.find({
    username: data.username
  })
  if(findUsername.length > 0)
    return res.json({ 'status': 'ko', 'message': 'Username already existing'});
  let findMail = await User.find({
    mail: data.mail
  })
  if(findMail.length > 0)
    return res.json({'status': 'ko',  'message': 'Mail already existing'});

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

  res.json({user_id: user.id, refreshToken: refreshToken});
}

const userModify = async (req, res) => {
  let data = req.body
  if(!data || !data.user_id)
    return res.json({'status': 'ko',  'message': 'Prerequisited not valid'});

  if(data.user_id=='')
    return res.json({'status': 'ko',  'message': 'Prerequisited not valid'});

  const objId = new mongoose.Types.ObjectId(data.user_id);
  const user = User.findById(objId)
  
  if(data.username && data.username != ''){
    let findUsername = await User.find({
      username: data.username
    })

    if(findUsername.length > 0)
      return res.status(412).json({ 'message': 'Username already existing'});
    
    user.username = data.username
  }

  if(data.password && data.password != ''){
    let salt = await bcrypt.genSalt(saltRounds);
    let cryptedPass = await bcrypt.hash(data.password, salt);
    user.password = cryptedPass;
  }
  await user.save()
  

  res.json({'status': 'ok'})
}

const userDelete = async (req, res) => {
  //lo faccio perché per eliminare richiede user e password
  let data = req.body
  const user = await checkPassword(data, res) 
  if(user.status)
    return user;
  const objId = new mongoose.Types.ObjectId(user[0]._id);
  const userDeleted = await User.findByIdAndDelete(objId)
  res.json({'status': 'ok', 'redirect': '/user/register', 'user': userDeleted._id})
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

  res.json({ 
    accessToken: accessToken,
    user_id: user._id,
  });
}

const userVerifyOrRefresh = async (req, res) => {
  let data = req.body

  if(!data.token || data.token == ''){
    return res.json({'status': 'ko',  'message': 'Prerequisited not valid'});
  }

  let accessToken = data.token;
  console.log(accessToken)
  if(!tokenManager.isExpired(data.token)){
    console.log("entra")
    let token = await Token.findOne({user: data.user_id})
    accessToken = tokenManager.createNewToken(req.body.username, token.token)
  }
  console.log(accessToken)

  res.json({ 
    accessToken: accessToken,
    user_id: data.user_id
  });
}


async function checkPassword(data, res){
  if(!data || !data.username || !data.password)
    return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'});

  if(data.username=='' || data.password=='')
    return res.json({ 'status': 'ko', 'message': 'Prerequisited not valid'});

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
    return res.json({'status': 'ko', 'message': 'User not found' });
  
  let compare = await bcrypt.compare(data.password, user[0].password)
  if(!compare){
    return res.json({'status': 'ko', 'message': 'Password or username not corret' });
  }
  return user;
}

module.exports = {
    userRegister, 
    userModify,
    userDelete,
    userLogin,
    userVerifyOrRefresh
}