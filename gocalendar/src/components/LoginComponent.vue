<script>
  import { defineComponent, ref } from 'vue';
  import axios from 'axios';
  import router from '../router/router';
  import utils from '../function/utils';
  import io from 'socket.io-client';

  
  const socket = io("http://localhost:3001");

  export default defineComponent({
    setup() {
      const username = ref('')
      const password = ref('')

      const submitForm = async () => {
        const formData = {
            username: username.value,
            password: password.value,
        };

        // Send the login request to the server
        const response = await utils.callApi(formData, '/user/login', "post")
        
        if(response.status == 'ko' || response == 'ko'){
            localStorage.setItem('user_id', null)
            localStorage.setItem('token', null)
            await router.push("/login")
            return null
        } else {
          localStorage.setItem('token', response.accessToken);
          localStorage.setItem('user_id', response.user_id);
          socket.emit("notification", localStorage.getItem('user_id'))
          utils.createNotificationSocket()
          setTimeout(() => {
            router.push('/calendar')
          }, 500);
        }
      }

      return {
        username,
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
                <label for="password">Password</label>
                <input type="password" id="password" v-model="password" required>
            </div>
            <button type="submit">Sign In</button>
        </form>
        <em>Non hai un account: </em><RouterLink to="/register" class="link">Sign Up</RouterLink>
    </div>
</template>

<style lang="scss" scoped>
    @import '../assets/style/logRouteStyle.scss'; 
</style>