<script>
  import { defineComponent, ref } from 'vue';
  import axios from 'axios';
  import router from '../router/router';
  import swal from 'sweetalert';

  export default defineComponent({
    setup() {},
    mounted() {
        swal(localStorage.getItem('token'))            
    }
  })
</script>

<template>
    Hai fatto login, bravissimo
</template>