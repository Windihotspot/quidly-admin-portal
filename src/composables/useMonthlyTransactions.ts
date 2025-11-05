import { ref, computed } from 'vue'
import type { Transaction, MonthData, SummaryData, ApiResponse, ChartViewType } from '@/types/transaction'
import { useMonths } from './useMonthly' // we'll create this helper like useQuarters

export const useMonthlyTransactions = () => {
  const transactions = ref<Transaction[]>([])
  const summaryData = ref<SummaryData>({})
  const loading = ref(true)
  const error = ref('')
  const selectedMonth = ref('')
  const chartView = ref<ChartViewType>('count')

  const { getMonth, generateMonths, getCurrentMonth } = useMonths()
  const months = generateMonths()

  // --- Compute monthly data ---
  const monthlyData = computed((): MonthData[] => {
    const data: Record<string, { count: number; value: number }> = {}
    months.forEach(m => (data[m] = { count: 0, value: 0 }))

    transactions.value.forEach(transaction => {
      if (transaction.entrydt) {
        const month = getMonth(transaction.entrydt)
        if (data.hasOwnProperty(month)) {
          data[month].count++
          data[month].value += parseFloat(String(transaction.amount)) || 0
        }
      }
    })

    return months.map(month => ({
      month,
      count: data[month].count,
      value: data[month].value,
    }))
  })

  // --- Filter transactions by month ---
  const filteredTransactions = computed(() => {
    if (!selectedMonth.value) return []
    return transactions.value.filter(
      t => t.entrydt && getMonth(t.entrydt) === selectedMonth.value
    )
  })

  // --- Aggregates for selected month ---
  const totalAmount = computed(() =>
    filteredTransactions.value.reduce((sum, t) => sum + (parseFloat(String(t.amount)) || 0), 0)
  )

  const averageAmount = computed(() =>
    filteredTransactions.value.length
      ? totalAmount.value / filteredTransactions.value.length
      : 0
  )

  const transactionCount = computed(() => filteredTransactions.value.length)

  // --- Toggle chart view (count/value) ---
  const toggleChartView = () => {
    chartView.value = chartView.value === 'count' ? 'value' : 'count'
  }

  // --- Mask sensitive data ---
  const maskSensitiveData = (jsonString: string): string => {
    try {
      const data = JSON.parse(jsonString)

      if (data.cardDetails) {
        if (data.cardDetails.cardno) {
          data.cardDetails.cardno = data.cardDetails.cardno.replace(/\d(?=\d{4})/g, '*')
        }
        if (data.cardDetails.cvv) {
          data.cardDetails.cvv = '***'
        }
      }

      return JSON.stringify(data, null, 2)
    } catch {
      return jsonString
        .replace(/"cardno":\s*"([^"]*)"/, (match, cardno) => {
          const masked = cardno.replace(/\d(?=\d{4})/g, '*')
          return `"cardno": "${masked}"`
        })
        .replace(/"cvv":\s*"[^"]*"/, '"cvv": "***"')
    }
  }

  // --- Fetch monthly transactions ---
  const fetchTransactions = async () => {
    loading.value = true
    error.value = ''

    try {
      const response = await fetch(
        'https://api01-dev.quidly.ng/api/txdb/procedure/admin_AllMerchants_getSuccessfulTransactions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_limit: 10000 }),
        }
      )

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data: ApiResponse = await response.json()

      if (data.status === 1 && Array.isArray(data.jsresult)) {
        transactions.value = data.jsresult as Transaction[]
        console.log(`Loaded ${transactions.value.length} monthly transactions`)
      } else {
        console.warn('Unexpected API response format, using sample data')
        transactions.value = generateSampleData()
      }
    } catch (err) {
      console.error('API Error:', err)
      error.value = `Failed to fetch transactions: ${(err as Error).message}`
      transactions.value = generateSampleData()
    } finally {
      loading.value = false
    }
  }

  // --- Fetch summary data ---
  const fetchSummaryData = async () => {
    try {
      const response = await fetch(
        'https://api01-dev.quidly.ng/api/txdb/procedure/admin_AllMerchants_monthlytxSummaryExtended_v2',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        }
      )

      const data = await response.json()
      summaryData.value = data.jsresult?.[0] || {}
      console.log('Monthly summary loaded:', summaryData.value)
    } catch (err) {
      console.warn('Failed to fetch monthly summary data:', err)
      summaryData.value = {
        this_month_transactions: 30,
        this_month_total_amount: 720000,
        last_month_transactions: 50,
        last_month_total_amount: 1100000,
        pct_change_transactions: '-40.00',
        pct_change_amount: '-34.55',
      }
    }
  }

  // --- Sample data fallback ---
  const generateSampleData = (): Transaction[] => {
    const sampleData: Transaction[] = []
    const merchants = ['quidlydemo01', 'testmerchant', 'samplestore']
    const channels = ['card', 'bank', 'wallet']

    for (let i = 0; i < 100; i++) {
      const randomDate = new Date()
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 365))

      sampleData.push({
        merchantid: merchants[Math.floor(Math.random() * merchants.length)],
        paymentid: `QLYm${Date.now()}${i}`,
        txid: null,
        paymentreference: 'payment via quidly',
        amount: Math.floor(Math.random() * 10000) + 100,
        status: Math.random() > 0.1 ? 0 : 6,
        entrydt: randomDate.toISOString(),
        id: 1000 + i,
        channelid: channels[Math.floor(Math.random() * channels.length)],
        apikey: `apikeydemo01-${54321 + i}`,
        scheme: null,
        jsondata: JSON.stringify({
          cardDetails: {
            cardno: '4999082100029373',
            cvv: '123',
            expirymonth: '12',
            expiryyear: '27',
            cardholder: '',
          },
          customerDetails: {
            email: 'test@yahoo.co.uk',
            firstname: 'Customer',
            lastname: 'Customer',
            phone: '',
            country: 'NG',
          },
        }),
        payment_status: Math.random() > 0.1 ? 1 : 0,
      })
    }

    return sampleData
  }

  // --- Initialization ---
  const initializeData = async () => {
    selectedMonth.value = getCurrentMonth()
    await Promise.all([fetchTransactions(), fetchSummaryData()])
  }

  // --- Currency formatting ---
  const formatCurrency = (amount?: number): string => {
    if (!amount) return '₦0'
    const naira = amount / 100
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(naira)
  }

  const formatCurrencyShort = (amount?: number): string => {
    if (!amount) return '0'
    const naira = amount / 100
    if (naira >= 1000000) return `${(naira / 1000000).toFixed(2)}m`
    if (naira >= 1000) return `${(naira / 1000).toFixed(0)}k`
    return naira.toString()
  }

  return {
    transactions,
    summaryData,
    loading,
    error,
    selectedMonth,
    chartView,
    monthlyData,
    filteredTransactions,
    totalAmount,
    averageAmount,
    transactionCount,
    months,
    fetchTransactions,
    fetchSummaryData,
    maskSensitiveData,
    initializeData,
    formatCurrency,
    formatCurrencyShort,
    toggleChartView,
  }
}
