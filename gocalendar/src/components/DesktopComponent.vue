<script>
  import { defineComponent, ref } from 'vue';
  import axios from 'axios';
  import router from '../router/router';
  import swal from 'sweetalert';
  import moment from 'moment';
  import config from '../../configApi.json';
  import Modal from './Modal.vue';

  export default defineComponent({
    setup() {
        var monthIndex = 7 - 1; // 0..11 instead of 1..12
        var names = [ 'sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat' ];
        var date = new Date(2023, monthIndex, 1);
        var result = [];
        while (date.getMonth() == monthIndex) {
            result.push({
                day: date.getDate(),
                dayOfWeek:date.getDay()
            })
            date.setDate(date.getDate() + 1);
        }
        while(result[0].dayOfWeek!=0){
            result.unshift({
                day: "",
                dayOfWeek: result[0].dayOfWeek-1
            })
        }
        while(result[result.length-1].dayOfWeek!=6){
            result.push({
                    day: "",
                    dayOfWeek: result[result.length-1].dayOfWeek+1
                })
        }
        let days = []
        let week = []
        console.log(typeof week)
        result.forEach(element => {
            week.push(element);
            if(week[week.length-1].dayOfWeek == 6){
                days.push({prova: week});
                week = []
            }
        });

        let ci = days

        const ciao = (ok)=>{
            console.log(ok)
            console.log(ci)
            ci = [ok]
            console.log(ci)
        }

        return {
            days, ci, ciao
        } 
    },
  })
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
                    <td v-for="day in week.prova" @click.prevent="ciao(day.day)">
                        {{ day.day }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <h1 v-for="ok in ci" :key="ci">{{ ok }}</h1>
</template>

<style lang="scss">
    @import '../assets/style/desktopCalendar.scss'; 
</style>