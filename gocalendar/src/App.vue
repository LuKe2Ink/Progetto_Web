<script setup>
  import { RouterLink, RouterView, useRouter} from 'vue-router'
  import { onMounted, ref } from 'vue';

  const router = useRouter()

  let logged = ref(false)
  let screenSize = window.window.innerWidth
  
  function isLogged(){
    const user_id= localStorage.getItem('user_id')
    logged.value = (user_id == 'null');
  }

  router.beforeEach((to, from, next) => {
    isLogged()
    next()
  })
  
  onMounted(() => { 
    isLogged()
  })

  function logout(){
    localStorage.setItem('token',null);
    localStorage.setItem('user_id',null);
    isLogged()
  }

  function showMenu(value){
    document.getElementById("rightMenu").hidden = value
  }
</script>

<template id="app">
  <header>

    <img alt="GoCalendar logo" class="logo" src="./assets/logo.png" />
    <h1>{{ count }}</h1>
    <div class="navList" v-if="screenSize >= 830">
      <nav>
        <div v-if="logged" class="logout" :key="logged"><a href="/home" class="link"> Home</a></div>
        <div v-if="!logged" class="logged" :key="logged"><a href="/calendar" class="link">Calendario</a></div>
        <div v-if="!logged" class="logged" :key="logged"><a href="/object" class="link">Oggetti</a></div>
        <div v-if="!logged" class="logged" :key="logged"><a href="/event/type" class="link">Etichette</a></div>
        <div v-if="!logged" class="logged" :key="logged"><a href="/graph" class="link">Grafico</a></div>
      </nav>
    </div>
    <div class="navHeader" v-if="screenSize >= 830">
      <nav>
        <div v-if="logged" class="login" :key="logged"><a href="/login" class="link"><i class="fa-solid fa-right-to-bracket"></i> Login</a></div>
        <div v-if="!logged" class="login" :key="logged"><a href="/login" class="link" @click ="logout"><i class="fa-solid fa-right-to-bracket"></i> Logout</a></div>
      </nav>
    </div>
    <div class="navHeaderReduce" v-if="screenSize < 830">
      <nav>
        <div class="login" @click="showMenu(false)"><i class="fa-solid fa-list"></i></div>
      </nav>
    </div>
    <div hidden="true" id="rightMenu" class="lateralMenu">
        <div class="login close" @click="showMenu(true)"><i class="fa-solid fa-xmark"></i></div>
        <div v-if="logged" class="login" :key="logged"><a href="/login" class="link"><i class="fa-solid fa-right-to-bracket"></i> Login</a></div>
        <div v-if="!logged" class="login" :key="logged"><a href="/login" class="link" @click ="logout"><i class="fa-solid fa-right-to-bracket"></i> Logout</a></div>
        <div v-if="logged" class="logout" :key="logged"><a href="/home" class="link"> Home</a></div>
        <div v-if="!logged" class="logged" :key="logged"><a href="/calendar" class="link">Calendario</a></div>
        <div v-if="!logged" class="logged" :key="logged"><a href="/object" class="link">Oggetti</a></div>
        <div v-if="!logged" class="logged" :key="logged"><a href="/event/type" class="link">Etichette</a></div>
        <div v-if="!logged" class="logged" :key="logged"><a href="/graph" class="link">Grafico</a></div>
    </div>
  </header>

  <div>
      <RouterView/>
      <RouterView name="home"></RouterView>
  </div>
</template>

<style lang="scss">
  @import './assets/style/navHeader.scss'; 
</style>
