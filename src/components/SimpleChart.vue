<template>
  <div class="chart-container">
    <div class="chart-header">
      <h3>Transaction Overview</h3>
      <p class="chart-subtitle">Click on bars to view quarter details</p>
    </div>
    <div class="simple-chart">
      <div class="chart-bars">
        <div 
          v-for="item in quarterlyData" 
          :key="item.quarter"
          class="chart-bar"
          :class="{ active: item.quarter === selectedQuarter }"
          :style="{ height: getBarHeight(item.count) + '%' }"
          @click="$emit('quarter-selected', item.quarter)"
        >
          <div class="bar-value">{{ item.count }}</div>
          <div class="bar-label">{{ item.quarter }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { QuarterData } from '@/types/transaction';

interface Props {
  quarterlyData: QuarterData[];
  selectedQuarter: string;
}

interface Emits {
  (e: 'quarter-selected', quarter: string): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const maxCount = computed(() => {
  return Math.max(...props.quarterlyData.map(item => item.count), 1);
});

const getBarHeight = (count: number): number => {
  return (count / maxCount.value) * 80 + 10; // 10% minimum height
};
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

.simple-chart {
  height: 300px;
  padding: 20px 0;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  height: 100%;
  gap: 8px;
  justify-content: space-around;
}

.chart-bar {
  flex: 1;
  background: #3b82f6;
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  min-height: 30px;
  max-width: 80px;
}

.chart-bar:hover {
  opacity: 0.8;
}

.chart-bar.active {
  background: #f97316;
}

.bar-value {
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px;
  margin-top: 4px;
}

.bar-label {
  position: absolute;
  bottom: -25px;
  font-size: 10px;
  color: #6b7280;
  white-space: nowrap;
  transform: rotate(-45deg);
  transform-origin: center;
}
</style>
