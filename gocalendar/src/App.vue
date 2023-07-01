<script>
  import { RouterLink, RouterView} from 'vue-router'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  export default {
    name: "App"
}
</script>

<template>
  <header>
  
    <img alt="GoCalendar logo" class="logo" src="./assets/logo.png" />
    <div class="navHeader">
      <nav>
        <div class="login"><RouterLink to="/login" class="link"><i class="fa-solid fa-right-to-bracket"></i> Login</RouterLink></div>
      </nav>
    </div>
  </header>

  <div>
      <RouterView/>
  </div>
  
</template>

<style lang="scss">
  @import './assets/style/navHeader.scss'; 
</style>
