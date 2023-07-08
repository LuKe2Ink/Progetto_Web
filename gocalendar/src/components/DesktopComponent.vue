<script>
    import { defineComponent, ref } from 'vue';
    import axios from 'axios';
    import router from '../router/router';
    import swal from 'sweetalert';
    import config from '../../configApi.json';
    import moment from 'moment';
    
    async function eventList(){
        const dataBody = {
            user_id: localStorage.getItem('user_id')
        }
        const response = await axios.post(config.apiAddress+':'+config.apiPort+'/events/list', 
            dataBody, {headers: { 'Authorization': 'Bearer '+localStorage.getItem('token')}}
        );
        const data = response.data;
        if(data.status == 'ko'){
            await swal({
                title: "Error",
                text: data.message,
                icon: "error",
                className: "sweetAlert"
            })
            localStorage.setItem('user_id', null)
            localStorage.setItem('token', null)
            await router.push("/login")
            return null
        }
        return data;
    }
    
    async function typeList(){
        const dataBody = {
            user_id: localStorage.getItem('user_id')
        }
        const response = await axios.post(config.apiAddress+':'+config.apiPort+'/types/list', 
            dataBody, {headers: { 'Authorization': 'Bearer '+localStorage.getItem('token')}}
        );
        const data = response.data;
        if(data.status == 'ko'){
            await swal({
                title: "Error",
                text: data.message,
                icon: "error",
                className: "sweetAlert"
            })
        }
        return data
    }

    function getDaysInMonth(month, year){
      console.log(month, year)
      var date = new Date(year, month, 1);

      var result = [];
      while (date.getMonth() == month) {
          let event = [];
          //mettere questo nel controller, passare, la month e lo year
          event = events.filter(element => (element.date.day == date.getDate() 
            && element.date.month == month && element.date.year))
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
    let eventTypes = null;
    if(events)
      eventTypes = await typeList();
    let fakeEvent = {
      description: '',
      title: '',
      location: '',
      people: [],
      type: {
        tipology: 'normal',
        _id:''
      }
    }

    export default defineComponent({
        // setup() {
          // let typeConvert = {};
          // let jsonOptions = []
          // eventTypes.forEach(element => {
          //     jsonOptions.push({
          //       text: element.name, value: element._id
          //     })
          //     typeConvert[element._id] = element.name
          // });
          // this.options = ref(jsonOptions)
          // this.titolo = ref('')
          // this.descrizione = ref('')
          // this.luogo = ref('') 
          // this.persone = ref('')
          // this.tipo = ref('')
          // this.oraInizio = ref('')
          // this.oraFine = ref('')
          // let month = moment().get('M')
          // let year = moment().get('Y')
          // //dinamico di default prende mese e anno corrente
          // this.days = getDaysInMonth(month, year);
          // // return {
          // //     days,
          // //     descrizione,
          // //     titolo,
          // //     luogo,
          // //     persone,
          // //     tipo,
          // //     oraInizio,
          // //     oraFine,
          // //     options,
          // //     typeConvert,
          // //     month,
          // //     year
          // // }
        // },
        created(){
          console.log()
          this.typeConvert = {};
          let jsonOptions = [];
          eventTypes.forEach(element => {
              jsonOptions.push({
                text: element.name, value: element._id
              })
              this.typeConvert[element._id] = element.name
          });
          this.options = ref(jsonOptions)
          this.titolo = ref('')
          this.descrizione = ref('')
          this.luogo = ref('') 
          this.persone = ref('')
          this.tipo = ref('')
          this.oraInizio = ref('')
          this.oraFine = ref('')
          this.month = moment().get('M')
          this.year = moment().get('Y')
          //dinamico di default prende mese e anno corrente
          this.days = getDaysInMonth(this.month, this.year);
        },
        data(){
            return{
                show: false,
                singleEvent: null,
                titleInput:false,
                descrizioneInput: false,
                titoloInput: false,
                luogoInput: false,
                personeInput: false,
                tipoInput: false,
                oraInput: false,
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
                options:null,
                typeConvert:null,
                month:null,
                year:null
            }
        },
        methods: {
            changeMonth(sequence){
              this.month += sequence;
              console.log(this.month)
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
              this.setInput(false);
              if(fakeEvent.date)
                delete fakeEvent.date
            },
            eventSingle(event, week, day){
              this.selectedCell.week = week;
              this.selectedCell.day = day;
              this.show = true
              this.singleEvent = event
              this.setInputValue(event)
            },
            createEvent(day, week, Indexday){
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
              //creazione
              if(this.singleEvent==null){
                let dataBody = this.checkInput(fakeEvent);
                if(dataBody){
                  dataBody["date"]=fakeEvent.date;
                  dataBody.date["time"] = this.oraInizio
                  const response = await axios.put(config.apiAddress+':'+config.apiPort+'/events/create', 
                    dataBody, {headers: { 'Authorization': 'Bearer '+localStorage.getItem('token')}}
                  );
                  const data = response.data;
                  if(data.status == 'ko'){
                      swal({
                          title: "Error",
                          text: data.message,
                          icon: "error",
                          className: "sweetAlert"
                      })
                  } else {
                    console.log(data.data)
                    this.days[this.selectedCell.week][this.selectedCell.day].event.push(data.data)
                  }
                }
              } else {
                //modifica
                let dataBody = this.checkInput(this.singleEvent);
                if(dataBody){
                  dataBody["date"]=this.singleEvent.date
                  dataBody.date.time = this.oraInizio
                  if(this.oraFine != '')
                    dataBody.date["finished_time"] = this.oraFine
                  const response = await axios.post(config.apiAddress+':'+config.apiPort+'/events/modify', 
                      dataBody, {headers: { 'Authorization': 'Bearer '+localStorage.getItem('token')}}
                  );
                  const data = response.data;
                  if(data.status == 'ko'){
                      await swal({
                          title: "Error",
                          text: data.message,
                          icon: "error",
                          className: "sweetAlert"
                      })
                  } else {
                    if(this.oraFine != '' && data.data.event_type.tipology != 'special '){
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
                      const response = await axios.put(config.apiAddress+':'+config.apiPort+'/history/add', 
                        {event_type_id: dataBody.event_type_id, event_id: dataBody.event_id, duration: minutes}, 
                        {headers: { 'Authorization': 'Bearer '+localStorage.getItem('token')}}
                      );
                    }
                    console.log(data.data)
                    let predicate = (element) => element._id == data.data._id;
                    let index = this.days[this.selectedCell.week][this.selectedCell.day].event.findIndex(predicate)
                    this.days[this.selectedCell.week][this.selectedCell.day].event[index] = data.data
                    console.log(this.days[this.selectedCell.week][this.selectedCell.day].event[index])
                  }
                }
                this.setInput(false);
              }
              this.modalSwitch()
            },
            async submitSpecialType(){
              
            },
            checkInput(event){
              let dataBody = null;
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
                  dataBody = {
                  user_id: localStorage.getItem('user_id'),
                  title: this.titolo,
                  description: this.descrizione,
                  people: personeForm.split(','),
                  location: this.luogo,
                  event_type_id: this.tipo,
                  event_id: event._id ? event._id : ''
                }
              }
              return dataBody;
            },
            setInput(bool){
              if(!this.creationEvent){
                this.descrizioneInput = bool
                this.titoloInput = bool
                this.luogoInput = bool
                this.personeInput = bool
                this.tipoInput = bool
                this.oraInput = bool
                this.modify = bool
              }
            },
            setInputValue(jsonEvent){
              this.descrizione = ref(jsonEvent.description)
              this.titolo = ref(jsonEvent.title)
              this.luogo = ref(jsonEvent.location) 
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
              
            }
        },
    });
</script>

<template>
    <div class="contenitore">
      <div class="month">
        <div class="prevMonth" @click="changeMonth(-1)"><i class="fa-solid fa-circle-left"></i></div>
        <h1>{{ monthName[month] }}</h1>
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
                        <div v-if="day.event.length > 0" class="eventList">
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
                <label>Titolo</label>
              </div>
              <p v-if="!titoloInput" @click="titoloInput = !titoloInput; modify = true">
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
              <p v-if="!descrizioneInput" @click="descrizioneInput = !descrizioneInput; modify = true">
                Descrizione: {{ descrizione }}
              </p>
              <div class="group" v-if="luogoInput">
                <input v-model="luogo" type="text" required="required">
                <span class="highlight"></span>
                <span class="bar"></span>
                <label>Luogo</label>
              </div>
              <p v-if="!luogoInput" @click="luogoInput = !luogoInput; modify = true">
                Luogo: {{ luogo }}
              </p>
              <div class="group" v-if="personeInput">
                <input v-model="persone" type="text" required="required">
                <span class="highlight"></span>
                <span class="bar"></span>
                <label>Persone</label>
              </div>
              <p v-if="!personeInput" @click="personeInput = !personeInput; modify = true">
                Persone: {{ persone }}
              </p>
              <div v-if="tipoInput" class="typesInput">
                <select v-model="tipo" required>
                  <option v-for="option in options" :value="option.value">
                    {{ option.text }}
                  </option>
                </select>
              </div>
              <p v-if="!tipoInput" @click="tipoInput = !tipoInput; modify = true" class="typesInput">
                Etichetta: {{ typeConvert[tipo] }}
              </p>
              <div class="group" v-if="oraInput">
                <input v-model="oraInizio" type="time" required="required">
                <input v-if="singleEvent != null && singleEvent.type.tipology =='normal'" v-model="oraFine" type="time">
                <label class="labelOrario">Orario</label>
              </div>
              <p v-if="!oraInput " @click="oraInput = !oraInput; modify = true">
                <p>
                  Ora inizio: {{ oraInizio }} 
                </p>
                <p v-if="singleEvent != null && singleEvent.type.tipology =='normal' ">
                  Ora Fine: {{ oraFine }} 
                </p>
              </p>
              <div v-if="!creationEvent && singleEvent.type.tipology == 'special'" 
                class="specialType">
                {{ "ciao" }}
                <div class="specialInput">
                  <form @submit.prevent="submitSpecialType">
                    <div class="group">
                      <input type="number" min="0" required />
                      <span class="bar"></span>
                      <label>Capitolo</label>
                    </div>
                    <div class="group">
                      <input type="number" min="0" required />
                      <span class="bar"></span>
                      <label>Pagina</label>
                    </div>
                  </form>
                </div>
                <div class="chronology">
                  <div class="history">

                  </div>
                </div>
              </div>
            </slot>
            <div v-if="modify" class="submitButton">
              <button type="submit"><i class="fa-solid fa-floppy-disk fa-xl"></i></button>
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