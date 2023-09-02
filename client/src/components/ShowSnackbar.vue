<template>
    <v-snackbar v-model="snackbar" :color="color" :timeout="timeout" top>
      {{ message }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
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
