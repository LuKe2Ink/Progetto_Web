const Toastify = require('toastify-js');
const io = require('socket.io-client');
const moment = require('moment');
const axios = require('axios')
const config = require('../../configApi.json');
const swal = require('sweetalert2')
const router = require('../router/router');

function createToastify(event, date){
    let message = "L'evento "+event.title+" del "+ date._i+" si è concluso"

    return Toastify({
        text: message,
        duration: 3000,
        destination: "http://localhost:8080/calendar",
        newWindow: false,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true,
        style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
        }
    })
}

function createNotificationSocket(){
    const socket = io("http://localhost:3001")
    socket.on("notifications-"+localStorage.getItem('user_id'), (events)=>{
      console.log("entra");
      console.log(events)
        events.forEach(element => {
          setTimeout(function(){
            var date = element.date
            var stringDate = date.day+"/"+(date.month+1)+"/"+date.year
            let expireDateEvent = moment(stringDate, 'D/M/YYYY')
            expireDateEvent.set({
              'hour': date.time?date.time.split(':')[0]:"00",
              'minute': date.time?date.time.split(':')[1]:"00",
              'second': '00'
            });
            // expireDateEvent.set({ 
            //   'day': date.day,
            //   'month': date.month+1,
            //   'year': date.year
            // })
            
            let checkExpireDate = expireDateEvent
            if(checkExpireDate.add(1, 'D')<=moment.now()){
              let toast = createToastify(element, expireDateEvent)
              toast.showToast();
            }
          }, 2000)
        });
    })
}

async function callApi(databody, route, type){
  let response;
  switch(type){
    case "get":
      response = await axios.get(config.apiAddress+':'+config.apiPort+route,
      {headers: { 'Authorization': 'Bearer '+localStorage.getItem('token')}, 
       // Never throw
      validateStatus: () => true});
      break;

    case "put":
      response = await axios.put(config.apiAddress+':'+config.apiPort+route, 
      databody, {headers: { 'Authorization': 'Bearer '+localStorage.getItem('token')}, 
      // Never throw
      validateStatus: () => true});
    break;
    
    case "post":
      response = await axios.post(config.apiAddress+':'+config.apiPort+route, 
      databody, {headers: { 'Authorization': 'Bearer '+localStorage.getItem('token')}, 
        // Never throw
        validateStatus: () => true});
    break;
  }

  if(response.status > 400){
    await swal.fire({
      title: "Errore",
      text: response.data.message,
      icon: "error",
      className: "sweetAlert"
    })

    // localStorage.clear();
    // window.location.href = config.clientAddress+config.clientPort+"/login"

    return 'ko';
  }

  if(response.data=='' && (typeof response.data) == 'object')
    return response.data
  
  return response.data==''?'ok':response.data;
}


function checkPassword(password){
  if(password.length < 8) {  
    return false; 
  } else if(password.search(/[a-z]/) < 0) {  
    return false; 
  } else if(password.search(/[A-Z]/) < 0) {  
    return false; 
  } else if(password.search(/[0-9]/) < 0) { 
    return false; 
  } 
  
  return true;
}

module.exports = {
    createToastify,
    createNotificationSocket,
    callApi,
    checkPassword
}