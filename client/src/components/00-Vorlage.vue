<template>
  <div></div>
</template>

<script>
export default {
  props: {
    modelValue: Object,
  },
  data () {
    return {
      // Hier kommen deine Daten/variablen
    }
  },
  computed: {
    InputValue: {
      get(){
        return this.modelValue;
      }
    }
  },
  methods: {
    // Hier kommen deine Methoden/Funktionen
  },
  mounted () {
    // Hier kannst du Code ausführen, nachdem die Komponente gerendert wurde
  }
  // Hier kommen eventuell weitere Hooks wie 'created', 'updated', 'destroyed', etc.
}
</script>

<style scoped>
/* Hier kannst du den Komponenten-Stil definieren (optional) */
</style>
