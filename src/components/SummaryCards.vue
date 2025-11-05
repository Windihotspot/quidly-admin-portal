<template>
  <div class="summary-grid">
    <!-- Quarter Summary - Top Left -->
    <div class="summary-card">
      <div class="card-header">
        <h3>Quarter Summary</h3>
      </div>
      <div class="card-content">
        <div class="main-metric">
          <span class="number green">{{ summaryData.this_quarter_transactions || 0 }}</span>
          <div class="change-indicator" :class="getChangeClass(summaryData.pct_change_transactions)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path :d="getArrowPath(summaryData.pct_change_transactions)"/>
            </svg>
            <span>{{ formatPercentage(summaryData.pct_change_transactions) }}</span>
          </div>
        </div>
        <div class="metric-label">transactions</div>
        
        <div class="secondary-metric">
          <span class="amount red">{{ formatCurrencyShort(summaryData.this_quarter_total_amount) }}</span>
          <div class="change-indicator" :class="getChangeClass(summaryData.pct_change_amount)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path :d="getArrowPath(summaryData.pct_change_amount)"/>
            </svg>
            <span>{{ formatPercentage(summaryData.pct_change_amount) }}</span>
          </div>
        </div>
        <div class="metric-label">value</div>
        
        <div class="last-period">
          <span class="last-label">last:</span>
          <span class="last-values">{{ summaryData.last_quarter_transactions || 0 }} | {{ formatCurrencyShort(summaryData.last_quarter_total_amount) }}</span>
        </div>
      </div>
    </div>

    <!-- Monthly Summary - Top Right -->
    <div class="summary-card">
      <div class="card-header">
        <h3>Monthly Summary</h3>
      </div>
      <div class="card-content">
        <div class="main-metric">
          <span class="number green">{{ summaryData.this_month_transactions || 0 }}</span>
          <div class="change-indicator positive">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14l5-5 5 5z"/>
            </svg>
            <span>71%</span>
          </div>
        </div>
        <div class="metric-label">transactions</div>
        
        <div class="secondary-metric">
          <span class="amount red">{{ formatCurrencyShort(summaryData.this_month_total_amount) }}</span>
          <div class="change-indicator negative">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
            <span>5%</span>
          </div>
        </div>
        <div class="metric-label">value</div>
        
        <div class="last-period">
          <span class="last-label">last:</span>
          <span class="last-values">{{ summaryData.last_month_transactions || 0 }} | {{ formatCurrencyShort(summaryData.last_month_total_amount) }}</span>
        </div>
      </div>
    </div>

    <!-- Logo Card - Bottom Left -->
    <div class="summary-card logo-card">
      <div class="logo-content">
        <div class="logo">
          <span class="logo-text-blue">teinnovate</span>
          <span class="logo-text-orange">capital</span>
        </div>
      </div>
    </div>

    <!-- Weekly Summary - Bottom Right -->
    <div class="summary-card weekly-card">
      <div class="card-header">
        <h3>Weekly Summary</h3>
      </div>
      <div class="card-content">
        <div class="main-metric">
          <span class="number green">{{ summaryData.this_week_transactions || 0 }}</span>
          <div class="change-indicator positive">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14l5-5 5 5z"/>
            </svg>
            <span>71%</span>
          </div>
        </div>
        <div class="metric-label">transactions</div>
        
        <div class="secondary-metric">
          <span class="amount red">{{ formatCurrencyShort(summaryData.this_week_total_amount) }}</span>
          <div class="change-indicator negative">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 10l5 5 5-5z"/>
            </svg>
            <span>5%</span>
          </div>
        </div>
        <div class="metric-label">value</div>
        
        <div class="last-period">
          <span class="last-label">last:</span>
          <span class="last-values">{{ summaryData.last_week_transactions || 0 }} | {{ formatCurrencyShort(summaryData.last_week_total_amount) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SummaryData } from '@/types/transaction';

interface Props {
  summaryData: SummaryData;
}

defineProps<Props>();

const formatCurrencyShort = (amount?: number): string => {
  if (!amount) return '0';
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(2)}m`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k`;
  }
  return amount.toString();
};

const formatPercentage = (pct?: string): string => {
  if (!pct) return '0%';
  const cleanPct = pct.replace('%', '');
  return `${Math.abs(parseFloat(cleanPct))}%`;
};

const getChangeClass = (pct?: string): string => {
  if (!pct) return 'neutral';
  const value = parseFloat(pct.replace('%', ''));
  return value >= 0 ? 'positive' : 'negative';
};

const getArrowPath = (pct?: string): string => {
  if (!pct) return 'M7 14l5-5 5 5z';
  const value = parseFloat(pct.replace('%', ''));
  return value >= 0 ? 'M7 14l5-5 5 5z' : 'M7 10l5 5 5-5z';
};
</script>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 16px;
  width: 100%;
  height: 400px; /* Fixed height for consistent 2x2 grid */
}

.summary-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.weekly-card {
  background: #fef3c7;
  border-color: #f59e0b;
}

.logo-card {
  background: #f8fafc;
  border-color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-header {
  margin-bottom: 12px;
}

.card-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.logo-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.logo {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.logo-text-blue {
  color: #3b82f6;
  font-weight: 700;
  font-size: 18px;
}

.logo-text-orange {
  color: #f97316;
  font-weight: 700;
  font-size: 18px;
}

.main-metric {
  display: flex;
  align-items: center;
  gap: 8px;
}

.secondary-metric {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.number {
  font-size: 22px;
  font-weight: 700;
}

.number.green {
  color: #16a34a;
}

.amount {
  font-size: 18px;
  font-weight: 700;
}

.amount.red {
  color: #dc2626;
}

.change-indicator {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  font-weight: 600;
}

.change-indicator.positive {
  color: #16a34a;
}

.change-indicator.negative {
  color: #dc2626;
}

.change-indicator.neutral {
  color: #6b7280;
}

.metric-label {
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 2px;
}

.last-period {
  margin-top: auto;
  font-size: 11px;
  color: #6b7280;
}

.last-label {
  font-weight: 500;
}

.last-values {
  margin-left: 6px;
}

/* Mobile responsive - stack vertically on small screens */
@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, auto);
    height: auto;
  }
}
</style>
