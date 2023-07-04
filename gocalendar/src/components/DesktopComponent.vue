<script>
    import { defineComponent, ref, resolveTransitionHooks } from 'vue';
    import axios from 'axios';
    import router from '../router/router';
    import swal from 'sweetalert';
    import moment from 'moment';
    import config from '../../configApi.json';
    console.log(config.apiAddress+':'+config.apiPort+'/events/list')
    
    async function eventList(){
        const dataBody = {
            user_id: localStorage.getItem('user_id')
        }
        const response = await axios.post(config.apiAddress+':'+config.apiPort+'/events/list', 
            dataBody, {headers: { 'Authorization': 'Bearer '+localStorage.getItem('token')}}
        );
        const data = response.data;
        if(data.status == 'ko'){
            console.log(data)
            swal({
                title: "Error",
                text: data.message,
                icon: "error",
                className: "sweetAlert"
            })
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
            console.log(data)
            swal({
                title: "Error",
                text: data.message,
                icon: "error",
                className: "sweetAlert"
            })
        }
        return data
    }
    
    let events = await eventList();
    let eventTypes = await typeList();
    console.log(eventTypes)

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
          console.log(jsonOptions)
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
                    days.push({prova: week});
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
                singleEvent: '',
                titleInput:false,
                descrizioneInput: false,
                titoloInput: false,
                luogoInput: false,
                personeInput: false,
                tipoInput: false
            }
        },
        methods: {
            modalSwitch(){
              this.show = !this.show;
              this.setInputAllFalse();
            },
            eventSingle(event){
              this.show = true
              console.log(event)
              this.singleEvent = event
              this.descrizione = ref(event.description)
              this.titolo = ref(event.title)
              this.luogo = ref(event.location) 
              let people = event.people.join(', ')
              this.persone = ref(people)
              this.tipo = ref(event.type._id)
            },
            inputShow(input){
              input=!input;
            },
            async submitForm(){
              let personeForm = this.persone.replace(' ', '')
              let personeEvento = this.singleEvent.people.join(',')
              if(this.titolo != this.singleEvent.title
                || this.descrizione != this.singleEvent.description
                || this.luogo != this.singleEvent.location
                || personeForm != personeEvento
                || this.tipo != this.singleEvent.type._id){
                const dataBody = {
                  user_id: localStorage.getItem('user_id'),
                  title: this.titolo,
                  description: this.descrizione,
                  date: this.singleEvent.date,
                  people: personeForm.split(','),
                  location: this.luogo,
                  event_type_id: this.tipo,
                  event_id: this.singleEvent._id
                }
                const response = await axios.post(config.apiAddress+':'+config.apiPort+'/events/modify', 
                    dataBody, {headers: { 'Authorization': 'Bearer '+localStorage.getItem('token')}}
                );
                const data = response.data;
                if(data.status == 'ko'){
                    console.log(data)
                    swal({
                        title: "Error",
                        text: data.message,
                        icon: "error",
                        className: "sweetAlert"
                    })
                } else {
                  events = await eventList()
                }
              }
            },
            setInputAllFalse(){
              this.descrizioneInput = false
              this.titoloInput = false
              this.luogoInput = false
              this.personeInput = false
              this.tipoInput = false
            }
        },
    });
</script>

<template>
    <div class="container">
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
                <tr :key="days" v-for="week in days">
                    <td v-for="day in week.prova">
                      <div class="events">
                        <div v-if="day.day != ''" class="dayNumber"><p>{{ day.day }}</p></div>
                        <div v-if="day.event.length > 0" class="eventList">
                            <div @click="eventSingle(event)" class="eventSingle" v-for="event in day.event">
                                <p>{{ event.title }}</p>
                            </div>
                        </div>
                        <div v-if="day.day != ''" class="addEvent"><i class="fa-solid fa-calendar-plus fa-2xs"></i></div>
                      </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <transition v-if="show" name="modal-fade">
    <div class="modal-backdrop" >
      <div class="modal">
        <form @submit.prevent="submitForm">
          <header class="modal-header" id="modalTitle" v-on:click.self="setInputAllFalse">
            <h1 @click="">
              <div class="group" v-if="titoloInput">
                <input v-model="titolo" type="text" required="required">
                <span class="highlight"></span>
                <span class="bar"></span>
                <label>Titolo</label>
              </div>
              <p v-if="!titoloInput" @click="titoloInput = !titoloInput">
                Titolo: {{ titolo }}
              </p>
            </h1>
            <button type="button" class="btn-close" @click="modalSwitch">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </header>
          <section class="modal-body" id="modalDescription" v-on:click.self="setInputAllFalse">
            <slot name="body">
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

<style lang="scss">
    @import '../assets/style/desktopCalendar.scss'; 
</style>