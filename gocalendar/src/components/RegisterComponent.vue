<script>
  import { defineComponent, ref } from 'vue';
  import axios from 'axios';
  import router from '../router/router';
  import swal from 'sweetalert2';
  import config from '../../configApi.json';
  import utils from '../function/utils';

  export default defineComponent({
    setup() {
      const username = ref('')
      const email = ref('')
      const password = ref('')

      const submitForm = async () => {
        if(!utils.checkPassword(password.value)){
          await swal.fire({
            title: "La password deve contere almeno un lettera maiuscola, una minuscola, un numero e un carattere speciale",
            icon:"error"
          })
        } else {
          const formData = {
            username: username.value,
            password: password.value,
            mail: email.value,
          };
            // Send the login request to the server
          const response = await utils.callApi(formData, '/user/register', "put")
          if(response.status == 'ko' || response == 'ko'){
              localStorage.setItem('user_id', null)
              localStorage.setItem('token', null)
              await router.push("/register")
              return null
          }else {
            await swal.fire({
              title: "Utente creato con successo",
              icon:"success"
            })
            router.push('/login')
          }
        }
      }

      return {
        username,
        email,
        password,
        submitForm,
      }
    },
  })
</script>

<template>
  <div class="container">
    <form @submit.prevent="submitForm" class="row">
        <div class="row">
            <label for="username">Username</label>
            <input type="username" id="username" v-model="username" required>
        </div>
        <div class="row">
            <label for="email">Email</label>
            <input type="mail" id="email" v-model="email" required>
        </div>
        <div class="row">
            <label for="password">Password</label>
            <input type="password" id="password" v-model="password" required>
        </div>
        <button type="submit">Registrati</button>
    </form>
    <em>Hai già un account: </em><RouterLink to="/login" class="link">Login</RouterLink>
  </div>
</template>


<style lang="scss" scoped>
    @import '../assets/style/logRouteStyle.scss'; 
</style>