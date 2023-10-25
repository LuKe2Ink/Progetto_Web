<template>
  <button style="margin-top: 200px;" @click="changeMonth(-1)">Indietro</button>
  <button @click="changeMonth(+1)">Avanti</button>
  <div id="divChart" style="width: 800px; height: max-content;"><canvas id="acquisitions"></canvas></div>
</template>

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



  export default defineComponent({
    data(){
      return{
        histories: histories,
        type: type,
        year: moment().year(),
        month: moment().month(),
        daysInMonth: 0,
        labels: [],
        maxMinutes: 0,
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
                title: {
                  display: true,
                  text: monthTranslate[this.month]+" "+this.year
                }
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'Giorno del mese'
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: 'Minuti'
                  },
                  min: 0,
                  max: this.maxMinutes,
                  ticks: {
                    // forces step size to be 50 units
                    stepSize: 5
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
            if(hist.length >= 1)
              dataSetData.push(hist[0].metadata.duration)
            else
              dataSetData.push(0)
          })
          let currentMax = dataSetData.max()
          if(currentMax>this.maxMinutes)
            this.maxMinutes = currentMax

          if(this.maxMinutes == 0)
            this.maxMinutes = 150

          console.log(element.color)
          this.datasets.push({
            label: element.name,
            data: dataSetData,
            borderColor: element.color,
            backgroundColor: element.color,
          })
        }

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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
