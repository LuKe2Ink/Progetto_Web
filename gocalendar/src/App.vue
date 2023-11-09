<script setup>
  import { RouterLink, RouterView, useRouter} from 'vue-router'
  import { onMounted, ref } from 'vue';

  import io from 'socket.io-client';
  import moment from 'moment';
  import utils from './function/utils';

  const socket = io("http://localhost:3001")

  if(localStorage.getItem('user_id')!='null'){
    socket.emit("notification", localStorage.getItem('user_id'))
    utils.createNotificationSocket()
  }

  const router = useRouter()

  let logged = ref(false)
  let screenSize = window.window.innerWidth
  
  function isLogged(){
    const user_id= localStorage.getItem('user_id')
    logged.value = (user_id == 'null' || !user_id);
  }

  router.beforeEach((to, from, next) => {
    isLogged()
    next()
  })
  
  onMounted(() => { 
    isLogged()
  })

  function logout(){
  console.log("si")
    socket.emit("disconnection", localStorage.getItem('user_id'))
    localStorage.setItem('token',null);
    localStorage.setItem('user_id',null);
    isLogged()
  }

  function showMenu(value){
    document.getElementById("rightMenu").hidden = value
  }

  let home = ref(false)
  let calendar = ref(false)
  let object = ref(false)
  let type = ref(false)
  let graph = ref(false)
  let login = ref(false)
  let user = ref(false)

  function changeRoute(route){
    const currentUrl = window.location.href;
    var route = currentUrl.split("/").pop();
    switch(route){
      case 'home':
        home = true;
        break;
      case 'calendar':
      calendar = true;
        break;
      case 'object':
        object = true;
        break;
      case 'type':
        type = true;
        break;
      case 'graph':
        graph = true;
        break;
      case 'login':
        login = true;
        break;
      case 'user':
        user = true;
        break;
    }
  }

  changeRoute();
</script>

<template id="app">
  <header>
    <img alt="GoCalendar logo" class="logo" src="./assets/logo.png" />
    <div class="nav">
      <div class="navList" v-if="screenSize >= 1050">
        <nav>
          <div v-if="logged" class="logout" :key="logged"><RouterLink to="/home" class="link" v-bind:class="{ active: home }" :key="home"> Home</RouterLink></div>
          <div v-if="!logged" class="logged" :key="logged"><RouterLink to="/calendar" class="link" v-bind:class="{ active: calendar }" :key="calendar">Calendario</RouterLink></div>
          <div v-if="!logged" class="logged" :key="logged"><RouterLink to="/object" class="link" v-bind:class="{ active: object }" :key="object">Oggetti</RouterLink></div>
          <div v-if="!logged" class="logged" :key="logged"><RouterLink to="/event/type" class="link" v-bind:class="{ active: type }" :key="type">Etichette</RouterLink></div>
          <div v-if="!logged" class="logged" :key="logged"><RouterLink to="/graph" class="link" v-bind:class="{ active: graph }" :key="graph">Grafico</RouterLink></div>
        </nav>
      </div>
      <div class="navHeader" v-if="screenSize >= 1050">
        <nav>
          <div v-if="logged" class="login" :key="logged"><RouterLink to="/login" class="link" v-bind:class="{ active: login }" :key="login"><i class="fa-solid fa-right-to-bracket"></i> Login</RouterLink></div>
          <div v-if="!logged" class="login" :key="logged" @click ="logout" ><RouterLink to="/login" class="link" ><i class="fa-solid fa-right-to-bracket"></i> Logout</RouterLink></div>
          <div v-if="!logged" class="user" :key="logged"><RouterLink to="/user" class="link user" v-bind:class="{ active: user }" :key="user"><i class="fa-solid fa-user-pen"></i></RouterLink></div>
        </nav>
      </div>
    </div>
    <div class="navHeaderReduce" v-if="screenSize < 1050">
      <nav>
        <div class="login" @click="showMenu(false)"><i class="fa-solid fa-list"></i></div>
      </nav>
    </div>
    <div hidden="true" id="rightMenu" class="lateralMenu">
        <div class="top">
          <div class="login close" @click="showMenu(true)"><i class="fa-solid fa-xmark"></i></div>
          <div v-if="!logged" class="user" :key="logged"><RouterLink to="/user" class="link" v-bind:class="{ active: user }" :key="user"><i class="fa-solid fa-user-pen"></i></RouterLink></div>
        </div>
        <div v-if="logged" class="login" :key="logged"><RouterLink to="/login" class="link" v-bind:class="{ active: login }" :key="login"><i class="fa-solid fa-right-to-bracket"></i> Login</RouterLink></div>
        <div v-if="!logged" class="login" :key="logged"><RouterLink to="/login" class="link" @click ="logout"><i class="fa-solid fa-right-to-bracket"></i> Logout</RouterLink></div>
        <div v-if="logged" class="logout" :key="logged"><RouterLink to="/home" class="link" v-bind:class="{ active: home }" :key="home"> Home</RouterLink></div>
        <div v-if="!logged" class="logged" :key="logged"><RouterLink to="/calendar" class="link" v-bind:class="{ active: calendar }" :key="calendar">Calendario</RouterLink></div>
        <div v-if="!logged" class="logged" :key="logged"><RouterLink to="/object" class="link" v-bind:class="{ active: object }" :key="object">Oggetti</RouterLink></div>
        <div v-if="!logged" class="logged" :key="logged"><RouterLink to="/event/type" class="link" v-bind:class="{ active: type }" :key="type">Etichette</RouterLink></div>
        <div v-if="!logged" class="logged" :key="logged"><RouterLink to="/graph" class="link" v-bind:class="{ active: graph }" :key="graph">Grafico</RouterLink></div>
    </div>
  </header>

  <div>
      <RouterView/>
      <RouterView name="home"></RouterView>
  </div>
</template>

<!-- <link rel="stylesheet" type="text/css" to="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css"></link> -->
<style lang="scss">
  @import './assets/style/navHeader.scss'; 
</style>

<style module>
  @import url("https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css");
</style>

