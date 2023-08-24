<template>
  <div style="width: 800px;"><canvas id="acquisitions"></canvas></div>
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
const labels = Utils.months({count: 7});
const data = {
  labels: labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
      yAxisID: 'y',
    },
    {
      label: 'Dataset 2',
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
      yAxisID: 'y1',
    }
  ]
};


export default defineComponent({


  mounted(){
    (async function() {
      const data = [
        { year: 2010, count: 10 },
        { year: 2011, count: 20 },
        { year: 2012, count: 15 },
        { year: 2013, count: 25 },
        { year: 2014, count: 22 },
        { year: 2015, count: 30 },
        { year: 2016, count: 28 },
      ];

      console.log(document.getElementById('acquisitions'))
      new Chart(
        document.getElementById('acquisitions'),
        {
          type: 'bar',
          options: {
            animation: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                enabled: false
              }
            }
          },
          data: {
            labels: data.map(row => row.year),
            datasets: [
              {
                label: 'Acquisitions by year',
                data: data.map(row => row.count)
              }
            ]
          }
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
