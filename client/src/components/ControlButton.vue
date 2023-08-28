<template>
  <button :style="buttonStyle">{{ buttonText }}</button>
</template>

<script>
export default {
  name: 'ControlButton',
  props: {
    buttonText: String, // Text on Buttton
    buttonColor: String // Color on Button
  },
  computed: {
    buttonStyle () {
      return {
        backgroundColor: this.buttonColor,
        color: 'white', // Optional: Textfarbe auf Weiß setzen, um sicherzustellen, dass der Text lesbar ist.
        padding: '10px 20px', // Beispiel-Styling für den Button, kannst du anpassen
        borderRadius: '5px'
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss"></style>
