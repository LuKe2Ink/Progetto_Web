<script>
    import { defineComponent, ref } from 'vue';
    import axios from 'axios';
    import router from '../router/router';
    import swal from 'sweetalert';
    import moment from 'moment';
    import config from '../../configApi.json';
    console.log(config.apiAddress+':'+config.apiPort+'/events/list')
    
    async function eventList(){
        const formData = {
            user_id: localStorage.getItem('user_id')
        }
        const response = await axios.post(config.apiAddress+':'+config.apiPort+'/events/list', 
                formData, {headers: { 'Authorization': 'Bearer '+localStorage.getItem('token')}}
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
    let events = await eventList();

    export default defineComponent({
        setup() {
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
                days
            } 
        },
        data(){
            return{
                show: false,
                time: 0,
                hola: ''
            }
        },
        methods: {
            reload(){
                this.show = !this.show;
                this.time++;
            },
            eventSingle(ciao){
                this.show = true
                this.hola = ciao.description
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
                        <div v-if="day.event.length > 0" class="eventList">
                            <div class="eventSingle" v-for="event in day.event">
                                <p @click="eventSingle(event)">{{ event.description }}</p>
                            </div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <transition v-if="show" name="modal-fade">
    <div class="modal-backdrop">
      <div class="modal"
        role="dialog"
        aria-labelledby="modalTitle"
        aria-describedby="modalDescription"
      >
        <header
          class="modal-header"
          id="modalTitle"
        >
          <slot name="header">
            This is the default tile!
          </slot>
          <button
            type="button"
            class="btn-close"
            @click="reload"
            aria-label="Close modal"
          >
            x
          </button>
        </header>

        <section
          class="modal-body"
          id="modalDescription"
        >
          <slot name="body">
            This is the default body!
          </slot>
        </section>

        <footer class="modal-footer">
          <slot name="footer">
            This is the default footer!
          </slot>
          <button
            type="button"
            class="btn-green"
            @click="close"
            aria-label="Close modal"
          >
          {{ hola }}
            Close me!
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<style lang="scss">
    @import '../assets/style/desktopCalendar.scss'; 
</style>