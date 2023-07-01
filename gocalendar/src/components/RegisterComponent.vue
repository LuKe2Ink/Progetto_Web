<script>
  import { defineComponent, ref } from 'vue';
  import axios from 'axios';
  import router from '../router/router';
  import swal from 'sweetalert';
  import config from '../../configApi.json';

  export default defineComponent({
    setup() {
      const username = ref('')
      const email = ref('')
      const password = ref('')

      const submitForm = async () => {
        console.log(username, password)
        const formData = {
            username: username.value,
            password: password.value,
            mail: email.value,
        };

        // Send the login request to the server
        console.log(formData, config.apiAddress+':'+config.apiPort+'/user/register')
        const response = await axios.put(config.apiAddress+':'+config.apiPort+'/user/register', formData);
        const data = response.data;
        if(data.status == 'ko'){
          swal({
            title: "Error",
            text: data.message,
            icon: "error",
            className: "sweetAlert"
          })
        } else 
          router.push('/login')
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


<style lang="scss">
    @import '../assets/style/userRouteStyle.scss'; 
</style>