<script setup>
import DisplayText from "./components/DisplayText.vue";
</script>

<template>
    <v-app>
        <v-container fluid id="main-container">
            <DisplayText></DisplayText>
        </v-container>
    </v-app>
</template>

<style scoped>
header {
  line-height: 1.5;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  #main-container{
      display: flex;
      justify-content: center;
  }
}
</style>
