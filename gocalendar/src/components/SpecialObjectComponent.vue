<script>
  import { defineComponent, ref } from 'vue';
  import axios from 'axios';
  import router from '../router/router';
  import swal from 'sweetalert';
  import config from '../../configApi.json';


  export default defineComponent({
    data(){
        return{
            img: ref(''),
            file: ''
        }
    },
    methods: {
        onFileChange(e) {
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length)
                return;
            this.createImage(files[0]);
            console.log("finito il change")
        },
        createImage(file) {
            var image = new Image();
            var reader = new FileReader();

            reader.onload = (e) => {
                this.img = e.target.result;
            };
            reader.readAsDataURL(file);
        },
        async submitForm(){
        var form = new FormData();
        var data = {
            user: localStorage.getItem('user'),
            name: "hello there",
            img: this.img,
        }
        form.set("img", this.img);
        form.set('name', 'hello there');
        form.set('user', localStorage.getItem('user'));
        // console.log(form.get("img"))
        // console.log(config.apiAddress+':'+config.apiPort+'/object/add')
        const response = await axios.put(config.apiAddress+':'+config.apiPort+'/object/add', data, 
            {headers: {Authorization: 'Bearer '+localStorage.getItem('token')} }
        );
        // , 'Content-Type': 'multipart/form-data'
        console.log(response)
      }
    },
  })
</script>


<template>
    <div class="contenitore">
        <div class="specialObject">
            <form @submit.prevent="submitForm()">
                <img :key="img" v-bind:src="img">
                <input v-on:change="onFileChange" type="file"/>
                <button type="submit">Eddaglie cazzo</button>
            </form>
        </div>
        <!-- Hello There from special object -->
    </div>
</template>

<style lang="scss">
    @import '../assets/style/specialObjectStyle.scss'; 
</style>