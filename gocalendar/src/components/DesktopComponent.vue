<script>
    import { defineComponent, ref, resolveTransitionHooks } from 'vue';
    import axios from 'axios';
    import router from '../router/router';
    import swal from 'sweetalert';
    import config from '../../configApi.json';
    
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
        _id:''
      }
    }

    export default defineComponent({
        setup() {
          let typeConvert = {};
          let jsonOptions = []
          eventTypes.forEach(element => {
              jsonOptions.push({
                text: element.name, value: element._id
              })
              typeConvert[element._id] = element.name
          });
          const options = ref(jsonOptions)
          let titolo = ref('')
          let descrizione = ref('')
          let luogo = ref('') 
          let persone = ref('')
          let tipo = ref('')
          //dinamico di default prende mese e anno corrente
          var monthIndex = 7 - 1; // 0..11 instead of 1..12
          var date = new Date(2023, monthIndex, 1);
          var result = [];
          while (date.getMonth() == monthIndex) {
              let event = [];
              event = events.filter(element => element.date.day == date.getDate())
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

            return {
                days,
                descrizione,
                titolo,
                luogo,
                persone,
                tipo,
                options,
                typeConvert
            }
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
                creationEvent: false,
                selectedCell:{
                  week: 0,
                  day:0
                }
            }
        },
        methods: {
            modalSwitch(){
              this.show = !this.show;
              this.creationEvent = false;
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
                month: 7,
                year: 2023
              }
              this.show = true
              this.setInput(true)
              this.creationEvent=true;
            },
            inputShow(input){
              input=!input;
            },
            async submitForm(){
              if(this.singleEvent==null){
                let dataBody = this.checkInput(fakeEvent);
                if(dataBody){
                  dataBody["date"]=fakeEvent.date
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
                    this.days[this.selectedCell.week][this.selectedCell.day].event.push(data.data)
                  }
                }
                
              } else {
                let dataBody = this.checkInput(this.singleEvent);
                if(dataBody){
                  dataBody["date"]=this.singleEvent.date
                    const response = await axios.post(config.apiAddress+':'+config.apiPort+'/events/modify', 
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
                    let predicate = (element) => element._id == data.data._id;
                    let index = this.days[this.selectedCell.week][this.selectedCell.day].event.findIndex(predicate)
                    this.days[this.selectedCell.week][this.selectedCell.day].event[index] = data.data
                  }
                }
                
                this.setInput(false);
              }
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
                || this.tipo != event.event_type){
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
                this.singleEvent = null
                this.descrizioneInput = bool
                this.titoloInput = bool
                this.luogoInput = bool
                this.personeInput = bool
                this.tipoInput = bool
              }
            },
            setInputValue(jsonEvent){
              this.descrizione = ref(jsonEvent.description)
              this.titolo = ref(jsonEvent.title)
              this.luogo = ref(jsonEvent.location) 
              let people = jsonEvent.people.join(', ')
              this.persone = ref(people)
              this.tipo = ref(jsonEvent.event_type)
            }
        },
    });
</script>

<template>
    <div class="contenitore">
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
                <tr :key="days" v-for="(week, indexWeek) in days">
                    <td v-for="(day, indexDay) in week">
                      <div class="events">
                        <div v-if="day.day != ''" class="dayNumber"><p>{{ day.day }}</p></div>
                        <div v-if="day.event.length > 0" class="eventList">
                            <div @click="eventSingle(event, indexWeek, indexDay)" class="eventSingle" v-for="event in day.event">
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
                <input v-model="titolo" type="text" required="required">
                <span class="highlight"></span>
                <span class="bar"></span>
                <label>Titolo</label>
              </div>
              <p v-if="!titoloInput" @click="titoloInput = !titoloInput">
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
              <p v-if="!descrizioneInput" @click="descrizioneInput = !descrizioneInput">
                Descrizione: {{ descrizione }}
              </p>
              <div class="group" v-if="luogoInput">
                <input v-model="luogo" type="text" required="required">
                <span class="highlight"></span>
                <span class="bar"></span>
                <label>Luogo</label>
              </div>
              <p v-if="!luogoInput" @click="luogoInput = !luogoInput">
                Luogo: {{ luogo }}
              </p>
              <div class="group" v-if="personeInput">
                <input v-model="persone" type="text" required="required">
                <span class="highlight"></span>
                <span class="bar"></span>
                <label>Persone</label>
              </div>
              <p v-if="!personeInput" @click="personeInput = !personeInput">
                Persone: {{ persone }}
              </p>
              <div v-if="tipoInput" class="typesInput">
                <select v-model="tipo">
                  <option v-for="option in options" :value="option.value">
                    {{ option.text }}
                  </option>
                </select>
              </div>
              <p v-if="!tipoInput" @click="tipoInput = !perstipoInputoneInput" class="typesInput">
                Etichetta: {{ typeConvert[tipo] }}
              </p>
            </slot>
            <div v-if="singleEvent==null" class="submitButton"><button type="submit">Hola</button></div>
          </section>
          <!-- <footer class="modal-footer">
            <slot name="footer">
              This is the default footer!
            </slot>
          </footer> -->
        </form>
      </div>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
    @import '../assets/style/desktopCalendar.scss'; 
</style>