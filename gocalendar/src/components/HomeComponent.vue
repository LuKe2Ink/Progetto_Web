<script>
export default {
  name: 'Home'
}
</script>

<template>
  <div class="contenitore">
    <div class="primoTesto">
      <p class="calendarParagraph">
        <b>Organizza</b> il tuo tempo, i tuoi hobby, i tuoi interessi e ricavane <b>info utili</b>
      </p>
      <img src="../assets/calendario.png" class="calendarImg">
    </div>
    
    <div class="secondoTesto">
      <img src="../assets/grafico.png" class="calendarImg">
      <p class="graphParagraph">
        I tuoi <b>progressi minuto per minuto</b>
      </p>
    </div>
    
    <div class="terzoTesto">
      <p class="allParagraph">
        Aggiungi <b>eventi</b>, <b>oggetti</b> ed <b>etichette</b> per personalizzare la tua esperienza
      </p>
      <div class="allImg">
        <img src="../assets/etichette.png" class="calendarImg">
        <img src="../assets/oggetti.png" class="calendarImg">
      </div>
    </div>
  </div>
</template>  

<style lang="scss" scoped>
  @import '../assets/style/homeStyle.scss'; 
</style>
  