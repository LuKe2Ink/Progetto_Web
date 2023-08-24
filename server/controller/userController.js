const User = require('../models/Users');
const Token = require('../models/Token');
const mongoose = require('mongoose')
const moment = require('moment') 
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt")
const saltRounds = 10;

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

  res.json({user_id: user.id});
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

  const user = await checkPassword(data, res)
  if(user.status)
    return user;

  const objId = new mongoose.Types.ObjectId(user[0]._id);
  let accessToken;
  if(!user[0].token){
    const refreshToken = jwt.sign({ username: req.body.username }, "refreshSecret");
    let token = await Token.create({
      type: "refreshToken",
      token: refreshToken,
      date: moment().format('DD/MM/YYYY HH:mm'),
      user: objId
    })
    accessToken = jwt.sign({ username: req.body.username,  refresh: refreshToken}, "accessSecret", {
      expiresIn: "1h",
    });
  } else {
    accessToken = jwt.sign({ username: req.body.username,  refresh: user[0].token.token}, "accessSecret", {
      expiresIn: "1h",
    });
  }

  console.log({ 
    accessToken: accessToken,
    user_id: user[0]._id
  });
  res.json({ 
    accessToken: accessToken,
    user_id: user[0]._id
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
    userLogin
}