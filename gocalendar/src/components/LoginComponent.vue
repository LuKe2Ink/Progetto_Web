<script>
  import { defineComponent, ref } from 'vue';
  import axios from 'axios';
  import router from '../router/router';
  import swal from 'sweetalert';

  export default defineComponent({
    setup() {
      const username = ref('')
      const password = ref('')

      const submitForm = async () => {
        console.log(username, password)
        const formData = {
            username: username.value,
            password: password.value,
        };

        // Send the login request to the server
        const response = await axios.post('http://localhost:3000/user/login', formData);
        const data = response.data;
        if(data.status == 'ko'){
          swal({
            title: "Error",
            text: data.message,
            icon: "error"
          })
        } else {
          const token = response.data.accessToken;
          localStorage.setItem('token', token);
          router.push('/calendar')
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

<style lang="scss">
    @import '../assets/style/userRouteStyle.scss'; 
</style>