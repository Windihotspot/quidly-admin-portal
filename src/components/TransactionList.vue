<template>
  <div class="transaction-list-container">
    <div class="list-header">
      <div class="list-title-section">
        <h3>{{ selectedQuarter }} - transaction list</h3>
        <div class="list-stats">
          <span class="stat-item">
            <strong>{{ transactionCount }}</strong> transactions
          </span>
          <span class="stat-separator">|</span>
          <span class="stat-item">
            <strong>{{ formatCurrency(totalAmount) }}</strong> total value
          </span>
        </div>
      </div>
    </div>

    <div class="table-container" v-if="!loading">
      <table class="transaction-table">
        <thead>
          <tr>
            <th>Payment ID</th>
            <th>Merchant</th>
            <th>Amount</th>
            <th>Reference</th>
            <th>Date</th>
            <th>Channel</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="transaction in paginatedTransactions" :key="transaction.id">
            <td class="payment-id">{{ transaction.paymentid }}</td>
            <td>{{ transaction.merchantid }}</td>
            <td class="amount">{{ formatCurrency(transaction.amount) }}</td>
            <td class="reference">{{ transaction.paymentreference }}</td>
            <td class="date">{{ formatDate(transaction.entrydt) }}</td>
            <td>
              <span class="channel-badge" :class="getChannelClass(transaction.channelid)">
                {{ transaction.channelid.toUpperCase() }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="getStatusClass(transaction.payment_status)">
                {{ getStatusText(transaction.payment_status) }}
              </span>
            </td>
            <td>
              <button 
                class="action-button"
                @click="showTransactionDetails(transaction)"
                title="View Details"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 21H5V3H13V9H19Z"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          class="pagination-button"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          Previous
        </button>
        
        <span class="pagination-info">
          Page {{ currentPage }} of {{ totalPages }} 
          ({{ filteredTransactions.length }} total)
        </span>
        
        <button 
          class="pagination-button"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Next
        </button>
      </div>
    </div>

    <div v-else class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading transactions...</p>
    </div>

    <!-- Transaction Details Modal -->
    <div v-if="selectedTransaction" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Transaction Details</h3>
          <button class="close-button" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <label>Payment ID:</label>
              <span>{{ selectedTransaction.paymentid }}</span>
            </div>
            <div class="detail-item">
              <label>Merchant ID:</label>
              <span>{{ selectedTransaction.merchantid }}</span>
            </div>
            <div class="detail-item">
              <label>Amount:</label>
              <span class="amount">{{ formatCurrency(selectedTransaction.amount) }}</span>
            </div>
            <div class="detail-item">
              <label>Reference:</label>
              <span>{{ selectedTransaction.paymentreference }}</span>
            </div>
            <div class="detail-item">
              <label>Date:</label>
              <span>{{ formatDate(selectedTransaction.entrydt) }}</span>
            </div>
            <div class="detail-item">
              <label>Channel:</label>
              <span class="channel-badge" :class="getChannelClass(selectedTransaction.channelid)">
                {{ selectedTransaction.channelid.toUpperCase() }}
              </span>
            </div>
            <div class="detail-item">
              <label>Status:</label>
              <span class="status-badge" :class="getStatusClass(selectedTransaction.payment_status)">
                {{ getStatusText(selectedTransaction.payment_status) }}
              </span>
            </div>
            <div class="detail-item">
              <label>API Key:</label>
              <span class="api-key">{{ selectedTransaction.apikey }}</span>
            </div>
          </div>
          
          <div class="json-section" v-if="selectedTransaction.jsondata">
            <label>JSON Data:</label>
            <pre class="json-display">{{ maskedJsonData }}</pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Transaction } from '@/types/transaction';

interface Props {
  transactions: Transaction[];
  selectedQuarter: string;
  totalAmount: number;
  transactionCount: number;
  loading: boolean;
  maskSensitiveData: (json: string) => string;
  formatCurrency: (amount: number) => string;
}

const props = defineProps<Props>();

const selectedTransaction = ref<Transaction | null>(null);
const currentPage = ref(1);
const itemsPerPage = 10;

const filteredTransactions = computed(() => props.transactions);

const totalPages = computed(() => {
  return Math.ceil(filteredTransactions.value.length / itemsPerPage);
});

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTransactions.value.slice(start, end);
});

const maskedJsonData = computed(() => {
  if (!selectedTransaction.value?.jsondata) return '';
  return props.maskSensitiveData(selectedTransaction.value.jsondata);
});

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getChannelClass = (channel: string): string => {
  switch (channel.toLowerCase()) {
    case 'card': return 'channel-card';
    case 'bank': return 'channel-bank';
    case 'wallet': return 'channel-wallet';
    default: return 'channel-default';
  }
};

const getStatusClass = (status: number): string => {
  return status === 1 ? 'status-success' : 'status-failed';
};

const getStatusText = (status: number): string => {
  return status === 1 ? 'SUCCESS' : 'FAILED';
};

const showTransactionDetails = (transaction: Transaction) => {
  selectedTransaction.value = transaction;
};

const closeModal = () => {
  selectedTransaction.value = null;
};
</script>

<style scoped>
.transaction-list-container {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.list-header {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.list-title-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.list-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.stat-item strong {
  color: #374151;
}

.stat-separator {
  color: #d1d5db;
}

.table-container {
  overflow-x: auto;
}

.transaction-table {
  width: 100%;
  border-collapse: collapse;
}

.transaction-table th,
.transaction-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

.transaction-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.transaction-table tbody tr:hover {
  background: #f9fafb;
}

.payment-id {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #6b7280;
}

.amount {
  font-weight: 600;
  color: #059669;
}

.reference {
  color: #6b7280;
  font-size: 12px;
}

.date {
  font-size: 12px;
  color: #6b7280;
}

.channel-badge,
.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.channel-card {
  background: #dbeafe;
  color: #1d4ed8;
}

.channel-bank {
  background: #fef3c7;
  color: #d97706;
}

.channel-wallet {
  background: #d1fae5;
  color: #065f46;
}

.channel-default {
  background: #f3f4f6;
  color: #6b7280;
}

.status-success {
  background: #d1fae5;
  color: #065f46;
}

.status-failed {
  background: #fee2e2;
  color: #dc2626;
}

.action-button {
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.action-button:hover {
  background: #2563eb;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.pagination-button {
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #6b7280;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px;
  color: #6b7280;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #374151;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.detail-item span {
  font-size: 14px;
  color: #374151;
}

.api-key {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #6b7280;
  word-break: break-all;
}

.json-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 24px;
}

.json-section label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}

.json-display {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  padding: 16px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  overflow-x: auto;
  white-space: pre-wrap;
  max-height: 300px;
  overflow-y: auto;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .pagination {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
