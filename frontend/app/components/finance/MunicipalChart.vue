<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts';

const props = defineProps<{ 
  title: string,
  xTitle: string,
  yTitle: string,
  xDataSeries: any[],
  yDataSeries: any[]
}>()


const chartContainer = ref<HTMLElement | null>(null);
let chartInstance: any = null

function getChartOption() {
  return {
    title: {
      text: props.title,
      textStyle: { fontSize: 14, color: "#7c7c7c" },
    },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      name: props.xTitle,
      data: props.xDataSeries,
      axisLine: { lineStyle: { color: "#363636" } },
      axisLabel: { color: "#7c7c7c" },
      boundaryGap: false 
    },
    yAxis: {
      type: "value",
      name: props.yTitle,
      axisLine: { lineStyle: { color: "#363636" } },
      axisLabel: {
        color: "#7c7c7c",
        formatter: function (value) {
            //if (value < 0) {
            //    return '{negative|' + value + '}'; // Apply a rich text style for negative values
            //}
            return value;
        },
        rich: { // Define rich text styles
            negative: {
                color: '#ff0400' // Color for negative values
            }
        }
      },
    },
    series: [
    {
      data: props.yDataSeries,
      type: "line",
      smooth: true,
      itemStyle: { color: "#F49983" },
      lineStyle: { color: "#F49983", width: 3 },
      areaStyle: { color: "rgba(238, 108, 77, 0.15)" },
    },],
    toolbox: {
        show: true,
        feature: {
            saveAsImage: {
                show: true,
                type: ['png', 'svg'],
                title: 'Save as SVG',
                background: 'transparent'
            }
        },
    },
  }
}
const chartOption = ref(getChartOption())

function resize(size: { width: number; height: number }) {
  if (chartInstance) chartInstance.resize();
}

onMounted(() => {
  if (chartContainer.value) {
    chartInstance = echarts.init(chartContainer.value, null, {
      renderer: 'svg'
    });
    chartInstance.setOption(chartOption.value);
  }
    // Optional: Handle resizing
    //this.resizeObserver = new ResizeObserver(() => {
    //    this.chartInstance.resize();
    //});
    //this.resizeObserver.observe(this.$refs.chartContainer);
})

onBeforeUnmount(() => {
    if (chartInstance) {
        chartInstance.dispose();
    }
    //if (resizeObserver) {
    //    resizeObserver.disconnect();
    //}
})

</script>

<template>
    <div ref="chartContainer" class="bg-white m-2" style="height: 400px;" />
</template>

<style scoped>
</style>
