<template>
  <div class="controlPanel">
    <div>
      <ControlButton buttonText="Boiler on" buttonColor="green" />
      <ControlButton buttonText="Boiler off" buttonColor="red" />
    </div>
    <div>
      <ControlButton buttonText="Auto on" buttonColor="green" />
      <ControlButton buttonText="Auto off" buttonColor="red" />
    </div>
    <div>
      <ControlButton buttonText="Stirr fast" buttonColor="green" />
      <ControlButton buttonText="Stirr slow" buttonColor="orange" />
      <ControlButton buttonText="Stirr off " buttonColor="red" />
    </div>
  </div>
</template>

<script>
import ControlButton from '@/components/ControlButton.vue'

export default {
  name: 'controlPanel',
  components: {
    ControlButton
  }
}
</script>
