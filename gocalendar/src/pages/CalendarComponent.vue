<script setup>
  import DesktopComponent from '../components/DesktopComponent.vue';
  import MobileComponent from '../components/MobileComponet.vue';
  function isMobile() {
    if( screen.width <= 760 ) {
        return true;
    }
    else {
        return false;
    }
  }
</script>

<template>
  <div v-if="!isMobile()">
    <DesktopComponent />
  </div>
  <div v-else>
    <MobileComponent />
  </div>
</template>