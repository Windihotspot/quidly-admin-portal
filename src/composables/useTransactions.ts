import { ref, computed } from 'vue';
import type { Transaction, QuarterData, SummaryData, ApiResponse, ChartViewType } from '@/types/transaction';
import { useQuarters } from './useQuarters';

export const useTransactions = () => {
  const transactions = ref<Transaction[]>([]);
  const summaryData = ref<SummaryData>({});
  const loading = ref(true);
  const error = ref('');
  const selectedQuarter = ref('');
  const chartView = ref<ChartViewType>('count'); // Chart view toggle

  const { getQuarter, generateQuarters, getCurrentQuarter } = useQuarters();
  const quarters = generateQuarters();

  // Compute quarterly data from transactions - enhanced with values
  const quarterlyData = computed((): QuarterData[] => {
    const data: Record<string, { count: number; value: number }> = {};
    quarters.forEach(q => data[q] = { count: 0, value: 0 });
    
    transactions.value.forEach(transaction => {
      if (transaction.entrydt) {
        const quarter = getQuarter(transaction.entrydt);
        if (data.hasOwnProperty(quarter)) {
          data[quarter].count++;
          data[quarter].value += (parseFloat(String(transaction.amount)) || 0);
        }
      }
    });
    
    return quarters.map(quarter => ({
      quarter,
      count: data[quarter].count,
      value: data[quarter].value
    }));
  });

  // Filter transactions by selected quarter
  const filteredTransactions = computed(() => {
    if (!selectedQuarter.value) return [];
    
    return transactions.value.filter(transaction => {
      return transaction.entrydt && getQuarter(transaction.entrydt) === selectedQuarter.value;
    });
  });

  // Calculate totals for selected quarter
  const totalAmount = computed(() => {
    return filteredTransactions.value.reduce((sum, t) => sum + (parseFloat(String(t.amount)) || 0), 0);
  });

  const averageAmount = computed(() => {
    return filteredTransactions.value.length ? totalAmount.value / filteredTransactions.value.length : 0;
  });

  const transactionCount = computed(() => {
    return filteredTransactions.value.length;
  });

  // Toggle chart view
  const toggleChartView = () => {
    chartView.value = chartView.value === 'count' ? 'value' : 'count';
  };

  // Mask sensitive data in JSON
  const maskSensitiveData = (jsonString: string): string => {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.cardDetails) {
        if (data.cardDetails.cardno) {
          data.cardDetails.cardno = data.cardDetails.cardno.replace(/\d(?=\d{4})/g, '*');
        }
        if (data.cardDetails.cvv) {
          data.cardDetails.cvv = '***';
        }
      }
      
      return JSON.stringify(data, null, 2);
    } catch {
      return jsonString
        .replace(/"cardno":\s*"([^"]*)"/, (match, cardno) => {
          const masked = cardno.replace(/\d(?=\d{4})/g, '*');
          return `"cardno": "${masked}"`;
        })
        .replace(/"cvv":\s*"[^"]*"/, '"cvv": "***"');
    }
  };

  // Fetch transactions from API
  const fetchTransactions = async () => {
    loading.value = true;
    error.value = '';
    
    try {
      const response = await fetch('https://api01-dev.quidly.ng/api/txdb/procedure/admin_AllMerchants_getSuccessfulTransactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ p_limit: 10000 })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      if (data.status === 1 && Array.isArray(data.jsresult)) {
        transactions.value = data.jsresult as Transaction[];
        console.log(`Loaded ${transactions.value.length} transactions`);
      } else {
        console.warn('Unexpected API response format, using sample data');
        transactions.value = generateSampleData();
      }
      
    } catch (err) {
      console.error('API Error:', err);
      error.value = `Failed to fetch transactions: ${(err as Error).message}`;
      transactions.value = generateSampleData();
    } finally {
      loading.value = false;
    }
  };

  // Fetch summary data from multiple endpoints
  const fetchSummaryData = async () => {
    try {
      const [quarterlyResponse, monthlyResponse, weeklyResponse] = await Promise.all([
        fetch('https://api01-dev.quidly.ng/api/txdb/procedure/admin_AllMerchants_quarterlytxSummaryExtended_v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }),
        fetch('https://api01-dev.quidly.ng/api/txdb/procedure/admin_AllMerchants_monthlytxSummaryExtended_v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        }),
        fetch('https://api01-dev.quidly.ng/api/txdb/procedure/admin_AllMerchants_weeklytxSummaryExtended_v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        })
      ]);

      const [quarterlyData, monthlyData, weeklyData] = await Promise.all([
        quarterlyResponse.json(),
        monthlyResponse.json(),
        weeklyResponse.json()
      ]);

      summaryData.value = {
        ...quarterlyData.jsresult?.[0],
        ...monthlyData.jsresult?.[0],
        ...weeklyData.jsresult?.[0]
      };

      console.log('Summary data loaded:', summaryData.value);

    } catch (err) {
      console.warn('Failed to fetch summary data:', err);
      summaryData.value = {
        this_quarter_transactions: 11,
        this_quarter_total_amount: 62,
        last_quarter_transactions: 236,
        last_quarter_total_amount: 3347,
        pct_change_transactions: '-95.34',
        pct_change_amount: '-98.15',
        this_month_transactions: 20,
        this_month_total_amount: 1250000,
        this_week_transactions: 20,
        this_week_total_amount: 1250000
      };
    }
  };

  // Generate sample data for development/fallback
  const generateSampleData = (): Transaction[] => {
    const sampleData: Transaction[] = [];
    const merchants = ['quidlydemo01', 'testmerchant', 'samplestore'];
    const channels = ['card', 'bank', 'wallet'];
    
    for (let i = 0; i < 100; i++) {
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 730));
      
      sampleData.push({
        merchantid: merchants[Math.floor(Math.random() * merchants.length)],
        paymentid: `QLYd${Date.now()}${i}`,
        txid: null,
        paymentreference: 'payment via quidly',
        amount: Math.floor(Math.random() * 10000) + 100,
        status: Math.random() > 0.1 ? 0 : 6,
        entrydt: randomDate.toISOString(),
        id: 900 + i,
        channelid: channels[Math.floor(Math.random() * channels.length)],
        apikey: `apikeydemo01-${12345 + i}`,
        scheme: null,
        jsondata: JSON.stringify({
          cardDetails: {
            cardno: "4999082100029373",
            cvv: "123",
            expirymonth: "12",
            expiryyear: "27",
            cardholder: ""
          },
          customerDetails: {
            email: "test@yahoo.co.uk",
            firstname: "Customer",
            lastname: "Customer",
            phone: "",
            country: "NG"
          }
        }),
        payment_status: Math.random() > 0.1 ? 1 : 0
      });
    }
    
    return sampleData;
  };

  // Initialize data
  const initializeData = async () => {
    selectedQuarter.value = getCurrentQuarter();
    await Promise.all([fetchTransactions(), fetchSummaryData()]);
  };

  // Utility functions with kobo to naira conversion
  const formatCurrency = (amount?: number): string => {
    if (!amount) return '₦0';
    const nairaAmount = amount / 100; // Convert kobo to naira
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(nairaAmount);
  };

  const formatCurrencyShort = (amount?: number): string => {
    if (!amount) return '0';
    const nairaAmount = amount / 100; // Convert kobo to naira
    if (nairaAmount >= 1000000) {
      return `${(nairaAmount / 1000000).toFixed(2)}m`;
    }
    if (nairaAmount >= 1000) {
      return `${(nairaAmount / 1000).toFixed(0)}k`;
    }
    return nairaAmount.toString();
  };

  return {
    transactions,
    summaryData,
    loading,
    error,
    selectedQuarter,
    chartView,
    quarterlyData,
    filteredTransactions,
    totalAmount,
    averageAmount,
    transactionCount,
    quarters,
    fetchTransactions,
    fetchSummaryData,
    maskSensitiveData,
    initializeData,
    formatCurrency,
    formatCurrencyShort,
    toggleChartView
  };
};
