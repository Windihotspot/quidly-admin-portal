<template>
  <div class="chart-container">
    <div class="chart-header">
      <div class="chart-title-section">
        <h3>Transaction Overview</h3>
        <p class="chart-subtitle">Click on bars to view quarter details</p>
      </div>
      
      <!-- Toggle Switch -->
      <div class="chart-toggle">
        <span class="toggle-label" :class="{ active: chartView === 'count' }">Count</span>
        <button 
          class="toggle-switch" 
          :class="{ active: chartView === 'value' }"
          @click="$emit('toggle-view')"
        >
          <div class="toggle-slider"></div>
        </button>
        <span class="toggle-label" :class="{ active: chartView === 'value' }">Value</span>
      </div>
    </div>
    
    <div class="chart-wrapper">
      <div ref="chartContainer" class="chart-element"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue';
import * as Highcharts from 'highcharts';
import type { QuarterData, ChartViewType } from '@/types/transaction';

interface Props {
  quarterlyData: QuarterData[];
  selectedQuarter: string;
  chartView: ChartViewType;
}

interface Emits {
  (e: 'quarter-selected', quarter: string): void;
  (e: 'toggle-view'): void;
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

const createChart = async () => {
  await nextTick();
  
  if (!chartContainer.value) {
    console.error('Chart container not found');
    return;
  }

  if (chart) {
    chart.destroy();
  }

  const isValueView = props.chartView === 'value';
  const chartData = props.quarterlyData.map((item) => ({
    name: item.quarter,
    y: isValueView ? item.value : item.count,
    color: item.quarter === props.selectedQuarter ? '#f97316' : '#3b82f6'
  }));

  try {
    chart = Highcharts.chart(chartContainer.value, {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        style: {
          fontFamily: 'Inter, system-ui, sans-serif'
        },
        animation: {
          duration: 300
        }
      },
      title: {
        text: ''
      },
      xAxis: {
        categories: props.quarterlyData.map(d => d.quarter),
        labels: {
          style: {
            color: '#6b7280',
            fontSize: '12px'
          }
        },
        lineColor: '#e5e7eb',
        tickColor: '#e5e7eb'
      },
      yAxis: {
        title: {
          text: isValueView ? 'Transaction Value (₦)' : 'Number of Transactions',
          style: {
            color: '#6b7280',
            fontSize: '12px'
          }
        },
        labels: {
          style: {
            color: '#6b7280',
            fontSize: '12px'
          },
          formatter: function() {
            if (isValueView) {
              return formatValue(this.value as number);
            }
            return this.value?.toString() || '';
          }
        },
        gridLineColor: '#f3f4f6',
        min: 0
      },
      tooltip: {
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderRadius: 8,
        shadow: true,
        style: {
          fontSize: '12px'
        },
        formatter: function() {
          if (isValueView) {
            return `<b>${this.x}</b><br/>Total Value: <b>${formatValue(this.y as number)}</b>`;
          }
          return `<b>${this.x}</b><br/>Transactions: <b>${this.y}</b>`;
        }
      },
      plotOptions: {
        column: {
          borderRadius: 4,
          borderWidth: 0,
          pointPadding: 0.1,
          groupPadding: 0.1,
          cursor: 'pointer',
          states: {
            hover: {
              brightness: 0.1
            }
          },
          point: {
            events: {
              click: function() {
                const quarter = this.name as string;
                emit('quarter-selected', quarter);
              }
            }
          }
        }
      },
      series: [{
        name: isValueView ? 'Transaction Value' : 'Transactions',
        type: 'column',
        data: chartData,
        showInLegend: false
      }],
      credits: {
        enabled: false
      },
      legend: {
        enabled: false
      },
      lang: {
        thousandsSep: ','
      }
    });
  } catch (error) {
    console.error('Error creating chart:', error);
  }
};

// Watch for data changes and recreate chart
watch(() => props.quarterlyData, () => {
  if (props.quarterlyData && props.quarterlyData.length > 0) {
    createChart();
  }
}, { deep: true });

watch(() => props.selectedQuarter, () => {
  if (!chart) return;
  const isValueView = props.chartView === 'value';
  const chartData = props.quarterlyData.map((item) => ({
    name: item.quarter,
    y: isValueView ? item.value : item.count,
    color: item.quarter === props.selectedQuarter ? '#f97316' : '#3b82f6'
  }));
  chart.series[0].setData(chartData, true);
});

watch(() => props.chartView, () => {
  createChart(); // Recreate chart when view changes
});

onMounted(() => {
  if (props.quarterlyData && props.quarterlyData.length > 0) {
    createChart();
  }
});
</script>

<style scoped>
.chart-container {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.chart-title-section h3 {
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

.chart-toggle {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f9fafb;
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
}

.toggle-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  transition: color 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.toggle-label.active {
  color: #374151;
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 22px;
  background: #e5e7eb;
  border: none;
  border-radius: 11px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle-switch.active {
  background: #3b82f6;
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(22px);
}

.chart-wrapper {
  height: 300px;
  width: 100%;
}

.chart-element {
  height: 100%;
  width: 100%;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .chart-toggle {
    align-self: flex-end;
  }
}
</style>
