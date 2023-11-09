<script>
    import { defineComponent, ref, toRaw } from 'vue';
    import axios from 'axios';
    import router from '../router/router';
    import swal from 'sweetalert2';
    import config from '../../configApi.json';
    import moment from 'moment';
    import tokenVerify from '../function/tokenSave';
    import utils from '../function/utils';

    await tokenVerify.verifyAndSaveToken();
    console.log(localStorage.getItem('user_id'))

    async function eventList(){
        const databody = {
            user_id: localStorage.getItem('user_id')
        }
        const response = await utils.callApi(databody, '/events/list', "post")
        if(response.status == 'ko' || response == 'ko'){
            localStorage.setItem('user_id', null)
            localStorage.setItem('token', null)
            await router.push("/login")
            return null
        }
        return response;
    }
    
    async function typeList(){
        const databody = {
            user_id: localStorage.getItem('user_id')
        }
        const response = await utils.callApi(databody, '/types/list', "post")
        if(response.status == 'ko' || response == 'ko'){
            localStorage.setItem('user_id', null)
            localStorage.setItem('token', null)
            await router.push("/login")
            return null
        }
        return response;
    }

    async function objectList(){
        const databody = {
            user_id: localStorage.getItem('user_id')
        }
        const response = await utils.callApi(databody, '/object/list', "post")
        if(response.status == 'ko' || response == 'ko'){
            localStorage.setItem('user_id', null)
            localStorage.setItem('token', null)
            await router.push("/login")
            return null
        }
        return response;
    }

    function getDaysInMonth(month, year){
      var date = new Date(year, month, 1);

      var result = [];
      while (date.getMonth() == month) {
          let event = [];
          //mettere questo nel controller, passare, la month e lo year
          event = events.filter(element => (element.date.day == date.getDate() 
            && element.date.month == month && element.date.year == year))
          result.push({
              day: date.getDate(),
              dayOfWeek:date.getDay(),
              event: event
          })
          date.setDate(date.getDate() + 1);
        }
        while(result[0].dayOfWeek!=0){
            result.unshift({
                day: "",
                dayOfWeek: result[0].dayOfWeek-1,
                event:[]
            })
        }
        while(result[result.length-1].dayOfWeek!=6){
            result.push({
                    day: "",
                    dayOfWeek: result[result.length-1].dayOfWeek+1,
                    event:[]
                })
        }
        let days = []
        let week = []
        result.forEach(element => {
            week.push(element);
            if(week[week.length-1].dayOfWeek == 6){
                days.push(week);
                week = []
            }
        });
        return days;
    }
    
    let events = await eventList();
    let eventTypes = await typeList();
    let special_object = await objectList();
    let fakeEvent = {
      description: '',
      title: '',
      location: '',
      people: [],
      type: {
        tipology: 'normal',
        _id:''
      },
      holiday: false
    }

    export default defineComponent({
        async created(){
          events = await eventList()
          eventTypes = await typeList();
          special_object = await objectList();
          this.typeConvert = {};
          let jsonOptions = [];
          eventTypes.forEach(element => {
              jsonOptions.push({
                text: element.name, value: element._id
              })
              this.typeConvert[element._id] = element.name
          });
          this.objectConverter = {};
          special_object.forEach(element => {
              this.objectConverter[element._id] = element.name
          });
          this.options = ref(jsonOptions)
          this.titolo = ref('')
          this.descrizione = ref('')
          this.luogo = ref('') 
          this.persone = ref('')
          this.tipo = ref('')
          this.oraInizio = ref('')
          this.oraFine = ref('')
          this.capitolo = ref('')
          this.pagina = ref('')
          this.episodio = ref('')
          this.orario = ref('')
          this.oggetto = ref('')
          this.link = ref('')
          this.file = ref('')
          this.fileData = ''
          this.month = moment().get('M')
          this.year = moment().get('Y')
          //dinamico di default prende mese e anno corrente
          this.days = getDaysInMonth(this.month, this.year);
        },
        data(){
            return{
                show: false,
                singleEvent: null,
                histories: null,
                titleInput:false,
                descrizioneInput: false,
                titoloInput: false,
                luogoInput: false,
                personeInput: false,
                tipoInput: false,
                oraInput: false,
                linkInput: false,
                fileInput: false,
                objectInput: false,
                creationEvent: false,
                modify: false,
                monthName: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
                selectedCell:{
                  week: 0,
                  day:0
                },
                days:null,
                descrizione:null,
                titolo:null,
                luogo:null,
                persone:null,
                tipo:null,
                oraInizio:null,
                oraFine:null,
                capitolo: null,
                pagina: null,
                episodio: null,
                oggetto: null,
                orario: null,
                link: null,
                fileData:null,
                file: null,
                options:null,
                optionsObject: [],
                typeConvert:null,
                objectConverter: null,
                month:null,
                year:null,
                showHistory: false,
                isSpecialObject: false,
                oldTime: null,
                holiday: false,
            }
        },
        methods: {
            onFileChange(e) {
                var files = e.target.files || e.dataTransfer.files;
                if (!files.length)
                    return;
                this.setFile(files[0]);
            },
            async setFile(file) {
              let sizeMB = file.size/(1024*1024)
                if(sizeMB>15){
                  await swal.fire({
                    title:"La grandezza del file supera i 15 MB",
                    icon:'error'
                  })
                  this.$refs.fileInput.value = ''
                } else {
                  var reader = new FileReader();
                  reader.onload = (e) => {
                      // var file = new File();
                      file.src = e.target.result;
                      this.fileData = {
                        fileName: file.name,
                        size: file.size
                      }
                      this.file = file.src; 
                  };
                  reader.readAsDataURL(file);
                }
            },
            changeMonth(sequence){
              this.month += sequence;
              if(this.month==-1){
                this.month = 11;
                this.year -= 1
              } else if(this.month==12){
                this.month = 0;
                this.year += 1
              }
              this.days = getDaysInMonth(this.month, this.year)
              this.show = true;
              this.show = false
            },
            modalSwitch(){
              this.show = !this.show;
              this.creationEvent = false;
              this.singleEvent = null
              this.histories = null
              this.setInput(false, 'close');
              if(fakeEvent.date)
                delete fakeEvent.date
              this.oggetto = ref('')
            },
            changeObject(event_id){
              let jsonOptions = [];
              const objectFiltered = special_object.filter((element)=>element.event_type == event_id)
              objectFiltered.forEach(element => {
                  jsonOptions.push({
                    text: element.name, value: element._id
                  })
              });
              this.optionsObject = ref(jsonOptions)
              if(jsonOptions.length>0){
                if(this.creationEvent)
                  this.objectInput = true;
                this.oggetto = ref('')
              }
            },
            async eventSingle(event, week, day){
              this.selectedCell.week = week;
              this.selectedCell.day = day;
              this.show = true
              this.singleEvent = event
              this.holiday = event.holiday?event.holiday:false
              let body = {}
              if(event.special_object){
                body = {
                  special_object: event.special_object._id
                }
              } else {
                body = {
                  event_id: event._id
                }
              }
              await tokenVerify.verifyAndSaveToken();
              const response = await utils.callApi(body, '/history/get', "post")
              if(response.status == 'ko' || response == 'ko'){
                  localStorage.setItem('user_id', null)
                  localStorage.setItem('token', null)
                  await router.push("/login")
                  return null
              }
              if(response && response.length){
                response.map((element)=>{
                  if(element.time){
                    let hours = element.time%360
                    let minutes = (element.time-(hours*360))%60
                    let seconds = (element.time-(hours*360)-(minutes*60))%60
                    element.time = hours+":"+minutes+":"+seconds
                  }
                  return element;
                })
                this.histories = response
              } else {
                this.histories = []
              }
              if(event.date.finished_time)
                this.oldTime = event.date.finished_time
              else
                this.oldTime = null
              this.changeObject(event.event_type)
              this.setInputValue(event)
            },
            createEvent(day, week, Indexday){
              this.tipoInput = true;
              this.selectedCell.week = week;
              this.selectedCell.day = Indexday;
              this.setInputValue(fakeEvent)
              fakeEvent["date"] = {
                day: parseInt(day),
                month: this.month,
                year: this.year
              }
              this.show = true
              this.setInput(true)
              this.creationEvent=true;
            },
            inputShow(input){
              input=!input;
            },
            async submitForm(){
              await tokenVerify.verifyAndSaveToken();
              //creazione
              if(this.singleEvent==null){
                let databody = this.checkInput(fakeEvent);
                if(databody){
                  databody["date"]=fakeEvent.date;
                  databody.date["time"] = this.oraInizio
                  if(this.oggetto != ''){
                    databody["special_object"] = this.oggetto;
                  }
                  const response = await utils.callApi(databody, '/events/create', "put")
                  if(response.status == 'ko' || response == 'ko'){
                      localStorage.setItem('user_id', null)
                      localStorage.setItem('token', null)
                      await router.push("/login")
                      return null
                  } else {
                    console.log(this.days[this.selectedCell.week][this.selectedCell.day].event, this.days[this.selectedCell.week][this.selectedCell.day])
                    this.days[this.selectedCell.week][this.selectedCell.day].event.push(response) 
                    this.addLinkOrFile(response._id)
                  }
                }
              } else {
                //modifica
                let swalResponse = await swal.fire({
                  title: 'Sei sicuro di voler modificare questo evento?',
                  showDenyButton: true,
                  showCancelButton: false,
                  confirmButtonText: 'Si',
                  denyButtonText: 'No'
                })
                if(swalResponse.isConfirmed){
                  this.addLinkOrFile(this.singleEvent._id)
                  let databody = this.checkInput(this.singleEvent);
                  if(databody){
                    databody["date"]=this.singleEvent.date
                    databody.date.time = this.oraInizio
                    if(this.oraFine != ''){
                      databody.date["finished_time"] = this.oraFine
                      let date = moment()
                      date.set('hours', this.oraInizio.split(":")[0])
                      date.set('minutes', this.oraInizio.split(":")[1])
                      date.set('seconds', 0)
                      let startTime = date.clone()
                      date.set('hours', this.oraFine.split(":")[0])
                      date.set('minutes', this.oraFine.split(":")[1])
                      date.set('seconds', 0)
                      let end = date.clone()
                      if(startTime>=end){
                        await swal.fire({
                          title: "L'orario di fine non è valido, riprovare",
                          icon: "error"
                        })
                        this.singleEvent.date.finished_time = this.oldTime
                        this.setInputValue(this.singleEvent)
                        return;
                      }
                    }
                    const response = await utils.callApi(databody, '/events/modify', "post")
                    if(response.status == 'ko' || response == 'ko'){
                        localStorage.setItem('user_id', null)
                        localStorage.setItem('token', null)
                        await router.push("/login")
                        return null
                    } else {
                      if(this.oraFine != '' && response.event_type.tipology != 'special '){
                        let date = moment()
                        date.set('hours', this.oraInizio.split(":")[0])
                        date.set('minutes', this.oraInizio.split(":")[1])
                        date.set('seconds', 0)
                        let startTime = date.clone()
                        date.set('hours', this.oraFine.split(":")[0])
                        date.set('minutes', this.oraFine.split(":")[1])
                        date.set('seconds', 0)
                        let end = date.clone()
                        var duration = moment.duration(end.diff(startTime));
                        var minutes = duration.asMinutes();
                        await tokenVerify.verifyAndSaveToken();
                        const response = await utils.callApi(
                          {event_type_id: databody.event_type_id, event_id: databody.event_id, duration: minutes, user_id: localStorage.getItem('user_id')},
                            '/history/add', "put")
                        if(response.status == 'ko' || response == 'ko'){
                            localStorage.setItem('user_id', null)
                            localStorage.setItem('token', null)
                            await router.push("/login")
                            return null
                        }
                      }
                      let predicate = (element) => element._id == response._id;
                      let index = this.days[this.selectedCell.week][this.selectedCell.day].event.findIndex(predicate)
                      this.days[this.selectedCell.week][this.selectedCell.day].event[index] = response
                    }
                  }
                  this.setInput(false);
                }
              }
              this.modalSwitch()
            },
            async submitSpecialType(type, type_id, event_id){
              if(type == 'serie tv' || type == 'film')
                await this.submitTypeTv(type_id, event_id)
              else 
                await this.submitTypePaper(type_id, event_id)
            },
            async submitTypeTv(type_id, event_id){
              const hour = this.orario.split(":")[0] * 360;
              const minutes = this.orario.split(":")[1] * 60;
              const seconds = this.orario.split(":")[2];
              const databody = {
                event_type_id: type_id, 
                event_id: event_id, 
                episode: this.episodio == ''? null : this.episodio,
                time: hour+minutes+seconds,
                object_id: this.oggetto,
                user_id: localStorage.getItem('user_id')
              }
              await tokenVerify.verifyAndSaveToken();
              const response = await utils.callApi(databody, '/history/add', "put")
              if(response.status == 'ko' || response == 'ko'){
                  localStorage.setItem('user_id', null)
                  localStorage.setItem('token', null)
                  await router.push("/login")
                  return null
              } else {
                await swal.fire({
                  title: "Storico dell'evento",
                  text: "Lo storico dell'evento è stato aggiunto con successo",
                  icon: "success",
                  className: "sweetAlert"
                })
                this.histories.unshift(response)
              }
            },
            async submitTypePaper(type_id, event_id){
              const databody = {
                event_type_id: type_id, 
                event_id: event_id, 
                chapter: this.capitolo,
                page: this.pagina,
                object_id: this.oggetto,
                user_id: localStorage.getItem('user_id')
              }
              await tokenVerify.verifyAndSaveToken();
              const response = await utils.callApi(databody, '/history/add', "put")
              if(response.status == 'ko' || response == 'ko'){
                  localStorage.setItem('user_id', null)
                  localStorage.setItem('token', null)
                  await router.push("/login")
                  return null
              } else {
                await swal.fire({
                  title: "Storico dell'evento",
                  text: "Lo storico dell'evento è stato aggiunto con successo",
                  icon: "success",
                  className: "sweetAlert"
                })
                this.histories.unshift(response)
              }
            },
            checkInput(event){
              let databody = null;
              let personeForm = this.persone.replace(' ', '')
              let personeEvento = ''
              if(event.people)
                personeEvento = event.people.join(',')
              if(this.titolo != event.title
                || this.descrizione != event.description
                || this.luogo != event.location
                || personeForm != personeEvento
                || this.tipo != event.event_type
                || (event.date && this.oraInizio != event.date.time)
                || (event.date && this.oraFine != event.date.finished_time)){
                  databody = {
                  user_id: localStorage.getItem('user_id'),
                  title: this.titolo,
                  description: this.descrizione,
                  people: personeForm.split(','),
                  location: this.luogo,
                  event_type_id: this.tipo,
                  event_id: event._id ? event._id : ''
                }
              }
              return databody;
            },
            setInput(bool, event=null){
              if(!this.creationEvent){
                this.descrizioneInput = bool
                this.titoloInput = bool
                this.luogoInput = bool
                this.personeInput = bool
                this.oraInput = bool
                if(!bool){
                  this.objectInput = false;
                  this.tipoInput = false;
                }
                if(event == 'close'){
                    this.modify = bool
                    this.linkInput = bool
                    this.fileInput = bool
                } else if(this.link == '' && this.file == ''){
                  this.modify = bool
                  this.linkInput = bool
                  this.fileInput = bool
                }
              }
            },
            setInputValue(jsonEvent){
              this.descrizione = ref(jsonEvent.description)
              this.titolo = ref(jsonEvent.title)
              this.luogo = ref(jsonEvent.location)
              if(jsonEvent.attachment){
                let predicate = (element) => element.link;
                let indexLink = jsonEvent.attachment.findIndex(predicate)
                predicate = (element) => element.file;
                let indexFile = jsonEvent.attachment.findIndex(predicate)
                this.link = ref(indexLink > -1  ? jsonEvent.attachment[indexLink].link : '')
                this.file = indexFile > -1 ? jsonEvent.attachment[indexFile].file : ''
                this.fileData = indexFile > -1 ? jsonEvent.attachment[indexFile].metadata : ''
              } else {
                this.link = ref('')
                this.fileData = ''
              }
              let people = jsonEvent.people.join(', ')
              this.persone = ref(people)
              this.tipo = ref(jsonEvent.event_type)
              if(jsonEvent.date){
                this.oraInizio = ref(jsonEvent.date.time)
                if(jsonEvent.date.finished_time){
                  this.oraFine = ref(jsonEvent.date.finished_time)
                } else {
                  this.oraFine = ref('')
                }
              } else {
                this.oraInizio = ref('')
              }
              if(jsonEvent.special_object)
                this.oggetto = jsonEvent.special_object._id
            },
            async deleteEvent(){
              let swalResponse = await swal.fire({
                    title: 'Sei sicuro di voler eliminare questo evento?',
                    showDenyButton: true,
                    showCancelButton: false,
                    confirmButtonText: 'Si',
                    denyButtonText: 'No'
                })
              if(swalResponse.isConfirmed){
                await tokenVerify.verifyAndSaveToken();
                const response = await utils.callApi({event_id:this.singleEvent._id}, '/events/delete', "post")
                if(response.status == 'ko' || response == 'ko'){
                    localStorage.setItem('user_id', null)
                    localStorage.setItem('token', null)
                    await router.push("/login")
                    return null
                }
                let predicate = (element) => element._id == response;
                let index = this.days[this.selectedCell.week][this.selectedCell.day].event.findIndex(predicate)
                this.days[this.selectedCell.week][this.selectedCell.day].event.splice(index, 1)
                this.modalSwitch()
              }
            },
            async addLinkOrFile(event_id){
              if(this.link!='' || this.file!=''){
                const databody = {
                  event_id: event_id,
                  link: this.link,
                  file: this.file,
                  user_id: localStorage.getItem('user_id')
                }
                if(this.fileData != ''){
                  databody["fileName"] = this.fileData.fileName
                  databody["size"] = this.fileData.size
                }
                const response = await utils.callApi(databody, '/attachment/add', "put")
                if(response.status == 'ko' || response == 'ko'){
                    localStorage.setItem('user_id', null)
                    localStorage.setItem('token', null)
                    await router.push("/login")
                    return null
                } else {
                  let predicate = (element) => element._id == event_id;
                  let index = this.days[this.selectedCell.week][this.selectedCell.day].event.findIndex(predicate)
                  if(this.days[this.selectedCell.week][this.selectedCell.day].event[index].attachment)
                    this.days[this.selectedCell.week][this.selectedCell.day].event[index].attachment=response.data;
                  else
                    this.days[this.selectedCell.week][this.selectedCell.day].event[index]['attachment']=response.data
                  
                }
              }
            },
            openLink(link){
              window.open(link, '_blank');
            },
            downloadFile(file){
              var a = document.createElement('A');
              a.href = file;
              a.download = this.fileData.fileName;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            },
            async deleteLinkFile(type){
              let swalResponse = await swal.fire({
                title: 'Sei sicuro di voler eliminare questo '+type+'?',
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: 'Si',
                denyButtonText: 'No'
              })
              if(swalResponse.isConfirmed){
                let indexAtt;
                if(type == 'link'){
                  let predicate = (element) => element.link;
                  indexAtt = this.singleEvent.attachment.findIndex(predicate)
                  if(indexAtt < 0)
                    this.link = ref('')
                } else {
                  let predicate = (element) => element.file;
                  indexAtt = this.singleEvent.attachment.findIndex(predicate)
                  if(indexAtt < 0)
                    this.file = ref('')
                }
                if(indexAtt >= 0){
                  const databody = {
                    attachment_id: this.singleEvent.attachment[indexAtt]._id
                  }
                  await tokenVerify.verifyAndSaveToken();
                  const response = await utils.callApi(databody, '/attachment/delete', "post")
                  if(response.status == 'ko' || response == 'ko'){
                      localStorage.setItem('user_id', null)
                      localStorage.setItem('token', null)
                      await router.push("/login")
                      return null
                  } else {
                    if(type == 'link'){
                      let predicate = (element) => element._id == this.singleEvent._id;
                      let index = this.days[this.selectedCell.week][this.selectedCell.day].event.findIndex(predicate)
                      this.days[this.selectedCell.week][this.selectedCell.day].event[index].attachment.splice(indexAtt, 1);
                      this.link = ref('')
                    } else {
                      let predicate = (element) => element._id == this.singleEvent._id;
                      let index = this.days[this.selectedCell.week][this.selectedCell.day].event.findIndex(predicate)
                      this.days[this.selectedCell.week][this.selectedCell.day].event[index].attachment.splice(indexAtt, 1);
                      this.file = ref('')
                      this.fileData = ''
                    }
                  }
                }
              }
            },
        },
    });
</script>

<template>
    <div class="contenitore">
      <div class="month">
        <div class="prevMonth" @click="changeMonth(-1)"><i class="fa-solid fa-circle-left"></i></div>
        <h1>{{ monthName[month] +" "+year }}</h1>
        <div class="nextMonth" @click="changeMonth(+1)"><i class="fa-solid fa-circle-right"></i></div>
      </div>
        <table>
            <tbody>
                <tr>
                    <th>Lunedi</th>
                    <th>Martedì</th>
                    <th>Mercoledì</th>
                    <th>Giovedì</th>
                    <th>Venerdì</th>
                    <th>Sabato</th>
                    <th class="lastTh">Domenica</th>
                </tr>
                <tr v-for="(week, indexWeek) in days">
                    <td v-for="(day, indexDay) in week">
                      <div class="events">
                        <div v-if="day.day != ''" class="dayNumber"><p>{{ day.day }}</p></div>
                        <div :key="day.event" v-if="day.event.length > 0" class="eventList">
                            <div :key="event" v-bind:style="{ borderColor: event.type.color }"
                              @click="eventSingle(event, indexWeek, indexDay)" 
                                class="eventSingle" v-for="event in day.event">
                                <p>{{ event.title }}</p>
                            </div>
                        </div>
                        <div @click="createEvent(day.day, indexWeek, indexDay)" v-if="day.day != ''" class="addEvent"><i class="fa-solid fa-calendar-plus fa-2xs"></i></div>
                      </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <transition v-if="show" name="modal-fade">
    <div class="modal-backdrop" >
      <div class="modal">
        <form @submit.prevent="submitForm()">
          <header class="modal-header" id="modalTitle" v-on:click.self="setInput(false)">
            <h1>
              <div class="group" v-if="titoloInput">
                <input v-model="titolo" class="inputTitle" type="text" required="required">
                <span class="highlight"></span>
                <span class="bar"></span>
                <label class="titleLabel">Titolo</label>
              </div>
              <p v-if="!titoloInput" @click="if(!holiday){titoloInput = !titoloInput; modify = true}">
                {{ titolo }}
              </p>
            </h1>
            <button type="button" class="btn-close" @click="modalSwitch">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </header>
          <section class="modal-body" id="modalDescription" v-on:click.self="setInput(false)">
            <slot name="body" class="modalBodySlot">
              <div class="group" v-if="descrizioneInput">
                <input v-model="descrizione" type="text" required="required">
                <span class="highlight"></span>
                <span class="bar"></span>
                <label>Descrizione</label>
              </div>
              <p v-if="!descrizioneInput" @click="if(!holiday){descrizioneInput = !descrizioneInput; modify = true}">
                Descrizione: {{ descrizione }}
              </p>
              <div class="group" v-if="luogoInput">
                <input v-model="luogo" type="text" required="required">
                <span class="highlight"></span>
                <span class="bar"></span>
                <label>Luogo</label>
              </div>
              <p v-if="!luogoInput && !holiday" @click="if(!holiday){luogoInput = !luogoInput; modify = true}">
                Luogo: {{ luogo }}
              </p>
              <div class="group" v-if="personeInput">
                <input v-model="persone" type="text" required="required">
                <span class="highlight"></span>
                <span class="bar"></span>
                <label>Persone</label>
              </div>
              <p v-if="!personeInput && !holiday" @click="if(!holiday){personeInput = !personeInput; modify = true}">
                Persone: {{ persone }}
              </p>
              <div v-if="tipoInput" class="typesInput">
                <p>Etichetta:
                  <div class="select-dropdown">
                    <select v-model="tipo" @click="changeObject(tipo)" required>
                      <option v-for="option in options" :value="option.value">
                        {{ option.text }}
                      </option>
                    </select>
                  </div>
                </p>
              </div>
              <p v-if="!tipoInput" class="typesInput">
                Etichetta: {{ typeConvert[tipo] }}
              </p>
              <div v-if="objectInput && optionsObject.length>0 " class="typesInput">
                <p>Oggetto:
                  <div class="select-dropdown">
                    <select :key="oggetto" v-model="oggetto" required>
                      <option v-for="option in optionsObject" :value="option.value">
                        {{ option.text }}
                      </option>
                    </select>
                  </div>
                </p>
              </div>
              <p v-if="(!creationEvent && tipo!='' && oggetto)&&!objectInput" class="typesInput">
                Oggetto collegato: {{ objectConverter[oggetto] }}
              </p>
              <div class="group" v-if="oraInput">
                <input v-model="oraInizio" type="time" required="required">
                <input v-if="singleEvent != null && singleEvent.type.tipology =='normal'" v-model="oraFine" type="time">
                <label class="labelOrario">Orario</label>
              </div>
              <p v-if="!oraInput  && !holiday" @click="if(!holiday){oraInput = !oraInput; modify = true}">
                <p>
                  Ora inizio: {{ oraInizio }} 
                </p>
                <p v-if="singleEvent != null && singleEvent.type.tipology =='normal' && !holiday ">
                  Ora Fine: {{ oraFine }} 
                </p>
              </p>
              <div class="group" v-if="linkInput">
                <input v-model="link" type="text">
                <span class="highlight"></span>
                <span class="bar"></span>
                <label>Link</label>
              </div>
              <div v-if="!linkInput && !holiday" class="linkButtonModify">
                <span @click="linkInput = !linkInput; modify = true">
                  Link 
                </span>
                <button type="button" v-if="link == ''" @click="linkInput = !linkInput; modify = true"><i class="fa-solid fa-plus"></i></button>
                <button type="button" v-if="link != '' " @click="deleteLinkFile('link')"><i class="fa-solid fa-trash-can"></i></button>
              </div>
              <div class="group" v-if="fileInput">
                <input ref="fileInput" v-on:change="onFileChange" type="file">
              </div>
              <div v-if="!fileInput && !holiday" class="fileButtonModify">
                <span @click="fileInput = !fileInput; modify = true">
                  File:
                  <button  type="button" v-if="fileData != '' " @click="deleteLinkFile('file')"><i class="fa-solid fa-trash-can"></i></button>
                  <span v-if="fileData != ''">
                    <p class="fileName">Nome: {{ fileData.fileName }}</p> 
                    Grandezza: {{ (fileData.size/1024).toFixed(2) }}MB</span>  
                </span>
                <button type="button" v-if="fileData == ''" @click="fileInput = !fileInput; modify = true"><i class="fa-solid fa-plus"></i></button>
              </div>
              <div v-if="!creationEvent && singleEvent.type.tipology == 'special'" 
                class="specialType">
                <div class="specialInput">
                  <form @submit.prevent="submitSpecialType(singleEvent.type.name, singleEvent.type._id, singleEvent._id)">
                    <div v-if="singleEvent.type.name == 'libro' || singleEvent.type.name == 'fumetto'"  
                      class="horizzontalInput">
                      <div class="group">
                        <input v-model="capitolo" type="number" min="0" required />
                        <span class="bar"></span>
                        <label>Capitolo</label>
                      </div>
                      <div class="group">
                        <input v-model="pagina" type="number" min="0" required />
                        <span class="bar"></span>
                        <label>Pagina</label>
                      </div>
                      <div class="addHistoryButton">
                        <button type="submit"><i class="fa-solid fa-plus"></i></button>
                      </div>
                    </div>
                    <div v-else class="horizzontalInput">
                      <div class="group" v-if="singleEvent.type.name == 'serie tv'">
                        <input v-model="episodio" type="number" min="1" required />
                        <span class="bar"></span>
                        <label>Episodio</label>
                      </div>
                      <div class="group">
                        <input v-model="orario" type="time" step="1" required />
                        <label class="labelOrario">Ora</label>
                      </div>
                      <div class="addHistoryButton">
                        <button type="submit"><i class="fa-solid fa-plus"></i></button>
                      </div>
                    </div>
                  </form>
                </div>
                <div class="chronology">
                  <div v-if="showHistory" class="histories">
                          {{ singleEvent.history }}
                    <table classh="historyTable" :key="singleEvent.history" >
                      <tbody>
                          <tr>
                              <th v-if="singleEvent.type.name == 'libro' || singleEvent.type.name == 'fumetto'"  >
                                Capitolo
                              </th>
                              <th v-if="singleEvent.type.name == 'libro' || singleEvent.type.name == 'fumetto'"  >
                                Pagina
                              </th>
                              <th v-if="singleEvent.type.name == 'serie tv'">
                                Episodio
                              </th>
                              <th v-if="singleEvent.type.name == 'serie tv' || singleEvent.type.name == 'film'">
                                Ora
                              </th>
                          </tr>
                          <tr v-for="element in histories">
                              <td v-if="singleEvent.type.name == 'libro' || singleEvent.type.name == 'fumetto'"  >
                                {{ element.metadata.chapter }}
                              </td>
                              <td v-if="singleEvent.type.name == 'libro' || singleEvent.type.name == 'fumetto'"  >
                                {{ element.metadata.page }}
                              </td>
                              <td v-if="singleEvent.type.name == 'serie tv'">
                                {{ element.metadata.episode }}
                              </td>
                              <td v-if="singleEvent.type.name == 'serie tv' || singleEvent.type.name == 'film'">
                                {{ element.metadata.duration }}
                              </td>
                          </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="showHistory" @click="showHistory = !showHistory">
                    <i v-if="!showHistory" class="fa-solid fa-caret-down"></i>
                    <i v-if="showHistory" class="fa-solid fa-caret-up"></i>
                  </div>
                </div>
              </div>
            </slot>
            <div v-if="!creationEvent && !holiday" class="underButton trashButton">
              <button type="button" @click="deleteEvent"><i class="fa-solid fa-trash-can fa-xl"></i></button>
            </div>
            <div v-if="modify || creationEvent" class="underButton submitButton">
              <button type="submit"><i class="fa-solid fa-floppy-disk fa-xl"></i></button>
            </div>
            <div v-if="link" class="underButton linkButton">
              <button type="button" @click="openLink(link)"><i class="fa-solid fa-link"></i></button>
            </div>
            <div v-if="fileData" class="underButton fileButton">
              <button type="button" @click="downloadFile(file)"><i class="fa-solid fa-download"></i></button>
            </div>
          </section>
        </form>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
    @import '../assets/style/desktopCalendar.scss'; 
</style>