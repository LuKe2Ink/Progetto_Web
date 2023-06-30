<script>
  import { RouterLink, RouterView} from 'vue-router'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  export default {
    name: "App"
}
</script>

<template>
  <header style="display: flex;">
  
    <img alt="GoCalendar logo" class="logo" src="./assets/logo.png" />
    <div class="navHeader">
      <nav>
        <RouterLink to="/register" class="link"><p>Register</p><em class="pi pi-user-plus"></em></RouterLink>
        <RouterLink to="/login" class="link"><p>Login</p><em class="pi pi-sign-in"></em></RouterLink>
      </nav>
    </div>
  </header>

  <div class="container mt-3">
      <RouterView/>
  </div>
  
</template>

<style>
  @import './assets/style/navHeader.scss'; 
</style>
