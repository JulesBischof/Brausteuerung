<template>
  <div>
    <line-chart :chart-data="chartData" :options="chartOptions"></line-chart>
  </div>
</template>

<script>


export default {

  data() {
    return {
      chartData: {
        datasets: [
          {
            label: 'Temperaturverlauf',
            borderColor: 'rgb(75, 192, 192)',
            fill: false,
            lineTension: 0,
            borderWidth: 2,
            data: [], // Hier fügen Sie Ihre Daten hinzu
          },
        ],
      },
      chartOptions: {
        scales: {
          xAxes: [
            {
              type: 'timeline',
              distribution: 'linear',
              time: {
                unit: 'minute', // Sie können die Zeiteinheit anpassen
                displayFormats: {
                  minute: 'mm:ss',
                },
              },
              ticks: {
                beginAtZero: true,
              },
            },
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: 'Temperatur (°C)',
              },
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    };
  },

  methods: {
    addPredefinedSegment(startTemp, endTemp, rate, duration) {
      const numSteps = (endTemp - startTemp) / rate;
      const currentTime = this.chartData.datasets[0].data.length;
      
      for (let i = 0; i < numSteps; i++) {
        const temp = startTemp + rate * i;
        this.chartData.datasets[0].data.push({ x: currentTime + i, y: temp });
      }

      // Hinzufügen einer Pause von "duration" Schritten (1 Schritt entspricht einer Minute)
      for (let i = 0; i < duration; i++) {
        const temp = endTemp;
        this.chartData.datasets[0].data.push({ x: currentTime + numSteps + i, y: temp });
      }

      // Aktualisieren Sie das Diagramm
      this.$data._chart.update();
    },
  },

  mounted() {
    // Beispiel: Hinzufügen eines vordefinierten Segments
    this.addPredefinedSegment(1, 50, 1, 20);
    this.addPredefinedSegment(50, 70, 2, 10);
    this.addPredefinedSegment(70, 80, 3, 0);
  },
};
</script>
