<template>
  <v-snackbar v-model="snackbar" :color="color" :timeout="timeout" top>
    {{ message }}
    <v-btn dark @click="snackbar = false">close</v-btn>
  </v-snackbar>
</template>

<script>
export default {
  props: {
    message: String,
    color: String,
    timeout: Number,
  },
  data() {
    return {
      snackbar: false,
    };
  },
};
</script>
