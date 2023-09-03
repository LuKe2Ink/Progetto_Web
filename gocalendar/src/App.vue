<script setup>
  import { RouterLink, RouterView, useRouter} from 'vue-router'
  import { onMounted, ref } from 'vue';

  const router = useRouter()

  let logged = ref(false)
  
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
</script>

<template id="app">
  <header>

    <img alt="GoCalendar logo" class="logo" src="./assets/logo.png" />
    <h1>{{ count }}</h1>
    <div class="navList">
      <nav>
        <div v-if="logged" class="logout" :key="logged"><a href="/home" class="link"> Home</a></div>
        <div v-if="!logged" class="logged" :key="logged"><a href="/calendar" class="link">Calendario</a></div>
        <div v-if="!logged" class="logged" :key="logged"><a href="/object" class="link">Oggetti</a></div>
        <div v-if="!logged" class="logged" :key="logged"><a href="/event/type" class="link">Etichette</a></div>
        <div v-if="!logged" class="logged" :key="logged"><a href="/graph" class="link">Grafico</a></div>
      </nav>
    </div>
    <div class="navHeader">
      <nav>
        <div v-if="logged" class="login" :key="logged"><a href="/login" class="link"><i class="fa-solid fa-right-to-bracket"></i> Login</a></div>
        <div v-if="!logged" class="login" :key="logged"><a href="/login" class="link" @click ="logout"><i class="fa-solid fa-right-to-bracket"></i> Logout</a></div>
      </nav>
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
