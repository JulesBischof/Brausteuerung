<template>
  <v-app>
    <v-app-bar app color="primary">
      <v-toolbar-title>Brausteuerung 2.0</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text link to="/">Home</v-btn>
      <v-btn text link to="/recipePanel">Recipe Panel</v-btn>
      <v-btn text link to="/controlPanel">Control Panel</v-btn>
    </v-app-bar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>

</script>

<style lang="scss"></style>
