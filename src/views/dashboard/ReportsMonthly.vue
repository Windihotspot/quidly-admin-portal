<template>
  <MainLayout>
    <div class="dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>Monthly Transactions</h1>
        <div class="date-info">
          <span class="date-label">date:</span>
          <span class="date-value">{{ currentDate }}</span>
        </div>
      </div>

      <!-- Content -->
      <div class="dashboard-content">
        <div class="dashboard-layout">
          <!-- Left Side: Summary Cards -->
          <div class="left-sidebar">
            <SummaryCards :summary-data="summaryData" />
          </div>

          <!-- Right Side: Charts + Transactions -->
          <div class="right-content">
            <!-- Chart with Toggle -->
            <TransactionChart
              v-if="!chartError"
              :quarterly-data="monthlyData"
              :selected-quarter="selectedMonth"
              :chart-view="chartView"
              @quarter-selected="handleMonthSelection"
              @toggle-view="toggleChartView"
            />
            <SimpleChart
              v-else
              :quarterly-data="monthlyData"
              :selected-quarter="selectedMonth"
              @quarter-selected="handleMonthSelection"
            />

            <!-- Transaction List -->
            <TransactionList
              :transactions="filteredTransactions"
              :selected-quarter="selectedMonth"
              :total-amount="totalAmount"
              :transaction-count="transactionCount"
              :loading="loading"
              :mask-sensitive-data="maskSensitiveData"
              :format-currency="formatCurrency"
            />
          </div>
        </div>
      </div>

      <!-- Loading overlay -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p>Loading monthly data...</p>
        </div>
      </div>

      <!-- Error banner -->
      <div v-if="error" class="error-banner">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 
             10 10 10-4.48 10-10S17.52 2 12 2zm1 
             15h-2v-2h2v2zm0-4h-2V7h2v6z"
          />
        </svg>
        <span>{{ error }}</span>
        <button @click="initializeData" class="retry-button">Retry</button>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import MainLayout from '@/layouts/full/MainLayout.vue'
import { onMounted, ref, onErrorCaptured } from 'vue'
import { useMonthlyTransactions } from '@/composables/useMonthlyTransactions'
import SummaryCards from '@/components/SummaryCards.vue'
import TransactionChart from '@/components/TransactionChart.vue'
import SimpleChart from '@/components/SimpleChart.vue'
import TransactionList from '@/components/TransactionList.vue'

// --- Use Monthly Composable ---
const {
  summaryData,
  loading,
  error,
  selectedMonth,
  chartView,
  monthlyData,
  filteredTransactions,
  totalAmount,
  transactionCount,
  maskSensitiveData,
  formatCurrency,
  initializeData,
  toggleChartView,
} = useMonthlyTransactions()

// --- Chart Error Fallback ---
const chartError = ref(false)

// --- Date Display ---
const currentDate = new Date().toLocaleDateString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

// --- Handle Month Selection ---
const handleMonthSelection = (month: string) => {
  selectedMonth.value = month
  console.log(`Selected month: ${month}`)
}

// --- Handle Chart Errors ---
onErrorCaptured(err => {
  if (err.message?.includes('Highcharts') || err.message?.includes('chart')) {
    console.warn('Chart error, fallback to simple chart:', err)
    chartError.value = true
    return false
  }
  return true
})

// --- Initialize ---
onMounted(() => {
  initializeData()
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f9fafb;
  position: relative;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.dashboard-header h1 {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.date-label {
  color: #6b7280;
  font-weight: 500;
}

.date-value {
  color: #374151;
  font-weight: 600;
}

.dashboard-content {
  padding: 24px 32px;
  max-width: 1600px;
  margin: 0 auto;
}

.dashboard-layout {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
  min-height: calc(100vh - 120px);
}

.left-sidebar {
  display: flex;
  flex-direction: column;
}

.right-content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

.error-banner {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #dc2626;
  font-size: 14px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.retry-button {
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #b91c1c;
}

@media (max-width: 1200px) {
  .dashboard-layout {
    grid-template-columns: 350px 1fr;
  }
}

@media (max-width: 1024px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .left-sidebar {
    order: 1;
  }
  .right-content {
    order: 2;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 12px;
    padding: 16px 20px;
  }
  .dashboard-header h1 {
    font-size: 24px;
  }
  .dashboard-content {
    padding: 16px 20px;
  }
}

@media (max-width: 480px) {
  .dashboard-header h1 {
    font-size: 20px;
  }
  .date-info {
    font-size: 12px;
  }
}
</style>
