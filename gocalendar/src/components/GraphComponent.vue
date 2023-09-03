<template>
  <div style="width: 800px; margin-top: 300px;"><canvas id="acquisitions"></canvas></div>
</template>

<script>
import Chart from 'chart.js/auto'
import { defineComponent, ref } from 'vue';
  import axios from 'axios';
  import router from '../router/router';
  import swal from 'sweetalert';
  import config from '../../configApi.json';
  import moment from 'moment';

async function historiesList(){
  const dataBody = {
      user_id: localStorage.getItem('user_id')
  }
  const response = await axios.post(config.apiAddress+':'+config.apiPort+'/history/get/all', 
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
  return data.data
}

let histories = await historiesList()
console.log(histories)
let type = []
for (let index = 0; index < histories.length; index++) {
  const element = histories[index];
  const ind = type.map(el => el._id).indexOf(element.type[0]._id);
  if(ind<0)
    type.push(element.type[0])
}
let monthTranslate = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"]
let daysInMonth = moment().daysInMonth()
let month = moment().month();
let labels = Array.from({length: daysInMonth}, (_, i) => i + 1)

let datasets = []
for (let index = 0; index < type.length; index++) {
  const element = type[index];
  const result = histories.filter((el) => el.type[0]._id == element._id);
  const dataSetData = []
  labels.forEach(el=>{
    const hist = histories.filter((e) => 
      e.event[0].date.month == month && e.event[0].date.day == el
        && e.type[0]._id == element._id
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

  datasets.push({
    label: element.name,
    data: dataSetData,
    borderColor: "#ff0000",
    backgroundColor: element.color,
    yAxisID: element._id,
  })
}
console.log(datasets)


const data = {
  labels: labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: [1,2,3],
      borderColor: "#ff0000",
      backgroundColor: "#ffffff",
      yAxisID: 'y',
    },
    {
      label: 'Dataset 2',
      data: [3,0,2],
      borderColor: "#ffff00",
      backgroundColor: "#ffff00",
      yAxisID: 'y1',
    }
  ]
};


export default defineComponent({
  mounted(){
    (async function() {

      console.log(document.getElementById('acquisitions'))
      new Chart(
        document.getElementById('acquisitions'),
        {
          type: 'line',
          data: data,
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
                text: 'Chart.js Line Chart - Multi Axis'
              }
            },
            scales: {
              y: {
                type: 'linear',
                display: false,
                position: 'left',
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',

                // grid line settings
                grid: {
                  drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
              },
            }
          },
        }
      );
    })();
  },});
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
