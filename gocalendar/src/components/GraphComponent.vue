<script>
  import Chart from 'chart.js/auto'
  import { defineComponent, ref, toRaw } from 'vue';
  import router from '../router/router';
  import moment from 'moment';
  import tokenVerify from '../function/tokenSave';
  import utils from '../function/utils';

  await tokenVerify.verifyAndSaveToken();
    
  Array.prototype.max = function() {
    return Math.max.apply(null, this);
  };
  const databody = {
      user_id: localStorage.getItem('user_id')
  }

  async function historiesList(){
    const response = await utils.callApi(databody, "/history/get/all", "post")
    if(response.status == 'ko'){
      setTimeout(() => {
        router.push('/login')
      }, 300);
    }
    return response
  }

  let histories = await historiesList()
  let user = await utils.callApi(databody, '/user/settings', 'post')

  let type = []
  for (let index = 0; index < histories.length; index++) {
    const element = histories[index];
    console.log(element)
    const ind = type.map(el => el._id).indexOf(element.type[0]._id);
    if(ind<0)
      type.push(element.type[0])
  }
  let monthTranslate = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"]

  let stepSize = 10
  if(user.graph_setting == 'hours')
    stepSize = 0.2
    if(user.graph_setting == 'seconds')
    stepSize = 100

  export default defineComponent({
    data(){
      return{
        histories: histories,
        type: type,
        year: moment().year(),
        month: moment().month(),
        daysInMonth: 0,
        labels: [],
        maxTime: 0,
        datasets: [],
        data: [],
        chart: '',
        ctx: ''
      }
    },
    mounted(){
      this.ctx = document.getElementById("acquisitions").getContext("2d")
      this.chartCreate();
    },
    methods: {
      async changeMonth(value){
        this.month += value
        if(this.month < 0){
          this.month = 11
          this.year -= 1
        } else if(this.month > 11) {
          this.month = 0
          this.year += 1
        }
        // document.getElementById('acquisitions').remove()
        // document.getElementById('divChart').append()
        this.clearData();
        this.chartCreate();
      },
      chartCreate(){
        this.createData();
        this.chart = new Chart(
          this.ctx,
          {
            type: 'line',
            data: this.data,
            options: {
              responsive: true,
              interaction: {
                mode: 'index',
                intersect: false,
              },
              stacked: false,
              plugins: {
                legend: {
                  labels: {
                      color: 'white'
                  }
                },
                title: {
                  color: 'white',
                  display: true,
                  text: monthTranslate[this.month]+" "+this.year
                }
              },
              scales: {
                x: {
                  ticks: { color: 'white'},
                  title: {
                    color: 'white',
                    display: true,
                    text: 'Giorno del mese'
                  }
                },
                y: {
                  title: {
                    color: 'white',
                    display: true,
                    text: 'Minuti'
                  },
                  min: 0,
                  max: this.maxTime,
                  ticks: {
                    color: 'white',
                    stepSize: stepSize
                  }
                }
              }
            },
          }
        );
      },
      createData(){
        this.daysInMonth = moment(this.year+'-'+(this.month+1)).daysInMonth()
        this.labels = Array.from({length: this.daysInMonth}, (_, i) => i + 1)
        for (let index = 0; index < this.type.length; index++) {
          const element = this.type[index];
          // const result = this.histories.filter((el) => el.type[0]._id == element._id);
          const dataSetData = []
          this.labels.forEach(el=>{
            const hist = this.histories.filter((e) => 
              e.event[0].date.month == this.month && e.event[0].date.day == el 
                && e.event[0].date.year == this.year && e.type[0]._id == element._id
            );
            if(hist.length > 1){
              hist.forEach((e, index)=>{
                if(index!=0)
                  hist[0].metadata.duration += e.metadata.duration
              });
            }
            if(hist.length >= 1){
              switch(user.graph_setting){
                case 'minutes':
                  dataSetData.push(hist[0].metadata.duration)
                  break;
                case 'hours':
                  dataSetData.push(hist[0].metadata.duration/60)
                  break;
                case 'seconds':
                  dataSetData.push(hist[0].metadata.duration*60)
                  break;
              }
            } else
              dataSetData.push(0)
          })
          console.log(dataSetData)
          let currentMax = dataSetData.max()
          console.log(dataSetData.max())
          if(currentMax>this.maxTime){
            this.maxTime = Math.ceil(currentMax)
          }

          this.datasets.push({
            label: element.name,
            data: dataSetData,
            borderColor: element.color,
            backgroundColor: element.color,
          })
        }
        
        if(this.maxTime == 0)
          this.maxTime = 10

        this.data = {
          labels: this.labels,
          datasets: this.datasets
        };
      },
      clearData(){
        this.labels = []
        this.datasets = []
        this.data = []
        toRaw(this.chart).destroy()
      }
    }
  });
</script>

<template>
  <div class="container">
    <div class="switchMonth">
      <div class="prevMonth" @click="changeMonth(-1)"><i class="fa-solid fa-circle-left"></i></div>
      <div class="nextMonth" @click="changeMonth(+1)"><i class="fa-solid fa-circle-right"></i></div>
    </div>
    <div id="divChart" style="width: 800px; height: max-content;"><canvas id="acquisitions"></canvas></div>
  </div>
</template>

<style lang="scss" scoped>
  @import '../assets/style/graphRouteStyle.scss'; 
</style>
