<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3>Transaction Value Overview</h3>
      <p class="chart-subtitle">Click on bars to view quarter details</p>
    </div>
    <div class="chart-wrapper">
      <div ref="chartContainer" class="chart-element"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue';
import * as Highcharts from 'highcharts';
import type { QuarterData } from '@/types/transaction';

interface Props {
  quarterlyData: QuarterData[];
  selectedQuarter: string;
}

interface Emits {
  (e: 'quarter-selected', quarter: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const chartContainer = ref<HTMLElement>();
let chart: Highcharts.Chart | null = null;

const formatValue = (value: number): string => {
  const nairaAmount = value / 100; // Convert kobo to naira
  if (nairaAmount >= 1000000) {
    return `₦${(nairaAmount / 1000000).toFixed(1)}M`;
  }
  if (nairaAmount >= 1000) {
    return `₦${(nairaAmount / 1000).toFixed(0)}K`;
  }
  return `₦${nairaAmount.toFixed(0)}`;
};

// Calculate quarterly values from data
const quarterlyValues = computed(() => {
  return props.quarterlyData.map(item => {
    // Calculate total value for this quarter from count (simplified)
    // In real implementation, this would come from the enhanced useTransactions
    const estimatedValue = item.count * 125000; // Average transaction value
    return {
      quarter: item.quarter,
      value: estimatedValue
    };
  });
});

const createChart = async () => {
  await nextTick();
  
  if (!chartContainer.value) return;

  if (chart) chart.destroy();

  const chartData = quarterlyValues.value.map((item) => ({
    name: item.quarter,
    y: item.value,
    color: item.quarter === props.selectedQuarter ? '#f97316' : '#3b82f6'
  }));

  try {
    chart = Highcharts.chart(chartContainer.value, {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        style: { fontFamily: 'Inter, system-ui, sans-serif' }
      },
      title: { text: '' },
      xAxis: {
        categories: quarterlyValues.value.map(d => d.quarter),
        labels: { style: { color: '#6b7280', fontSize: '12px' } }
      },
      yAxis: {
        title: { 
          text: 'Transaction Value (₦)',
          style: { color: '#6b7280', fontSize: '12px' }
        },
        labels: {
          style: { color: '#6b7280', fontSize: '12px' },
          formatter: function() {
            return formatValue(this.value as number);
          }
        },
        min: 0
      },
      tooltip: {
        backgroundColor: '#ffffff',
        formatter: function() {
          return `<b>${this.x}</b><br/>Total Value: <b>${formatValue(this.y as number)}</b>`;
        }
      },
      plotOptions: {
        column: {
          cursor: 'pointer',
          point: {
            events: {
              click: function() {
                emit('quarter-selected', this.name as string);
              }
            }
          }
        }
      },
      series: [{
        name: 'Transaction Value',
        type: 'column',
        data: chartData,
        showInLegend: false
      }],
      credits: { enabled: false }
    });
  } catch (error) {
    console.error('Error creating value chart:', error);
  }
};

watch(() => props.quarterlyData, createChart, { deep: true });
watch(() => props.selectedQuarter, () => {
  if (!chart) return;
  const chartData = quarterlyValues.value.map((item) => ({
    name: item.quarter,
    y: item.value,
    color: item.quarter === props.selectedQuarter ? '#f97316' : '#3b82f6'
  }));
  chart.series[0].setData(chartData, true);
});

onMounted(createChart);
</script>

<style scoped>
/* Same styles as TransactionChart */
.chart-container {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-header {
  margin-bottom: 16px;
}

.chart-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 4px 0;
}

.chart-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.chart-wrapper {
  height: 300px;
  width: 100%;
}

.chart-element {
  height: 100%;
  width: 100%;
}
</style>
