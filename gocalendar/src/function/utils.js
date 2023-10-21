const Toastify = require('toastify-js');
const io = require('socket.io-client');
const moment = require('moment')

function createTostify(event, date){
    let message = "L'evento "+event.title+" del "+ date.format('D/M/Y')+" si è concluso"

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
        events.forEach(element => {
          setTimeout(function(){
            var date = element.date
            let expirDateEvent = moment().set({
              'year': date.year, 
              'month': date.month, 
              'day': date.day,
              'hour': date.time?date.time.split(':')[0]:"00",
              'minute': date.time?date.time.split(':')[1]:"00",
              'second': '00'
            });
            if(expirDateEvent.add('1 day')<=moment.now()){
              let toast = createTostify(element, expirDateEvent.add('-1 day'))
              toast.showToast();
            }
          }, 1000)
        });
    })
}

module.exports = {
    createTostify,
    createNotificationSocket
}