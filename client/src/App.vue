<template>
  <v-app>
    <v-toolbar color="primary">
      <v-toolbar-title>Brausteuerung 2.0</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text link to="/">Home</v-btn>
      <v-btn text link to="/recipePanel">Recipe Panel</v-btn>
      <v-btn text link to="/controlPanel">Control Panel</v-btn>
      <v-btn text link to="/configurationView">Configuration</v-btn>
    </v-toolbar>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>

</script>

<style lang="scss"></style>
