<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
import axios from 'axios'
import moment from 'moment'

// -------------------------
// ✅ Interfaces
// -------------------------
interface Merchant {
  merchant_id: string
  business_name: string
  verified: boolean
  created_at?: string
  photoid?: string
  poaid?: string
  companydocid?: string
  business_address?: string
  accountid?: string
  merchantname?: string
  companyregno?: string
  companytype?: string
  business_email?: string
  entrydt?: string
}

interface CallbackRequest {
  id: number
  merchant_id: string
  status: number
  created_at: string
  note?: string
}

interface Transaction {
  id: number
  merchant_id: string
  entrydt: string
  amount: number
  payment_status: number
}

// -------------------------
// ✅ Refs and States
// -------------------------
const loading = ref<boolean>(false)

const merchantPage = ref<number>(1)
const callbackPage = ref<number>(1)
const showMerchantDialog = ref<boolean>(false)
const showCallbackDialog = ref<boolean>(false)
const selectedMerchant = ref<Merchant | null>(null)
const selectedCallback = ref<CallbackRequest | null>(null)
const verifyMerchant = ref<boolean>(false)
const callbackNote = ref<string>('')

const totalMerchantsCount = ref<number>(0)
const callBackRequestCount = ref<number>(0)
const merchants = ref<Merchant[]>([])
const callbacks = ref<CallbackRequest[]>([])
const totalSuccessfulTransactionAmount = ref<number>(0)
const totalTransactionAmount = ref<number>(0)
const totalPageCount = ref<number | null>(null)

const dailyTotal = ref<number>(0)
const weeklyTotal = ref<number>(0)
const monthlyTotal = ref<number>(0)
const totalTransactionCount = ref<number>(0)
const dailyTransactionCount = ref<number>(0)
const weeklyTransactionCount = ref<number>(0)
const monthlyTransactionCount = ref<number>(0)
const totalSuccessfulTransactionCount = ref<number>(0)

// -------------------------
// ✅ Refs and States
// -------------------------
const filePhotoId = ref<string | null>(null)
const filePoaImage = ref<string | null>(null)
const fileCompanyDocumentImage = ref<string | null>(null)
const photoIdImage = ref<string | null>(null)
const poaImage = ref<string | null>(null)
const companyDocImage = ref<string | null>(null)

const defaultPhotoId = 'https://cdn.pixabay.com/photo/2017/03/08/21/19/file-2127825_640.png'
const defaultPoa = 'https://cdn.pixabay.com/photo/2017/03/08/21/19/file-2127825_640.png'
const defaultCompanyDoc = 'https://cdn.pixabay.com/photo/2017/03/08/21/19/file-2127825_640.png'

// const photoIdSrc = computed(() => filePhotoId.value || defaultPhotoId)
// const poaSrc = computed(() => filePoaImage.value || defaultPoa)
// const companyDocSrc = computed(() => fileCompanyDocumentImage.value || defaultCompanyDoc)


// -------------------------

// -------------------------
// ✅ Utility Formatters
// -------------------------
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value)

const formatDate = (date: string | Date): string => moment(date).format('DD MMM YYYY')

// -------------------------
// ✅ API Calls
// -------------------------

// Get paginated merchants
const fetchTotalMerchants = async (): Promise<void> => {
  try {
    const reqData = { p_verified: 0, p_page_limit: 10, p_page_no: 1 }

    const response = await axios.post(
      'https://api01-dev.quidly.ng/api/mdb/procedure/admin_GetPagedMerchantsByVerifiedStatusExtended',
      reqData
    )

    if (response.data.status === 1) {
      const merchantsData = response.data.jsresult[0].merchants.Data as Merchant[]
      const totalPages = response.data.jsresult[0].merchants.TotalPages as number

      totalPageCount.value = totalPages
      merchants.value = merchantsData

      console.log('Total pages:', totalPageCount.value)
      console.log('Merchants:', merchants.value)
    } else {
      console.error('Error retrieving merchants:', response.data)
    }
  } catch (error) {
    console.error('Error fetching merchants:', error)
  }
}

// Get merchant count
const fetchTotalMerchantsCount = async (): Promise<void> => {
  try {
    const reqData = { p_verified: 0 }

    const response = await axios.post(
      'https://api01-dev.quidly.ng/api/mdb/procedure/admin_GetMerchantsByVerifiedStatusExtended',
      reqData
    )

    if (response.data.status === 1) {
      const merchantsData = response.data.jsresult[0].merchants as Merchant[]
      totalMerchantsCount.value = merchantsData.length
      console.log('Merchants count:', totalMerchantsCount.value)
    } else {
      console.error('Error retrieving merchants count:', response.data)
    }
  } catch (error) {
    console.error('Error fetching merchant count:', error)
  }
}

// Get pending callback requests
const fetchCallBackCount = async (): Promise<void> => {
  try {
    const reqData = { p_status: 0 }

    const response = await axios.post(
      'https://api01-dev.quidly.ng/api/mdb/procedure/admin_GetCallbackRequestsByStatus',
      reqData
    )

    if (response.data.status === 1) {
      const callbackData = response.data.jsresult as CallbackRequest[]
      callbacks.value = callbackData
      callBackRequestCount.value = callbackData.length

      console.log('Callback count:', callBackRequestCount.value)
      console.log('Callbacks:', callbacks.value)
    } else {
      console.error('Error retrieving callbacks count:', response.data)
    }
  } catch (error) {
    console.error('Error fetching callback count:', error)
  }
}

// Get all transactions (for total, daily, weekly, monthly)
const fetchTotalTransactions = async (): Promise<void> => {
  try {
    const reqData = { p_limit: 20 }

    const response = await axios.post(
      'https://api01-dev.quidly.ng/api/txdb/procedure/admin_AllMerchants_getLatestTransactions',
      reqData
    )

    if (response.data.status === 1) {
      const transactions = response.data.jsresult as Transaction[]

      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const startOfWeek = new Date(startOfDay)
      startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay())
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      // Compute totals
      const computeAmount = (start: Date): number =>
        transactions.reduce((total, t) => {
          const date = new Date(t.entrydt)
          return date >= start ? total + (t.amount || 0) : total
        }, 0)

      dailyTotal.value = computeAmount(startOfDay)
      weeklyTotal.value = computeAmount(startOfWeek)
      monthlyTotal.value = computeAmount(startOfMonth)
      totalTransactionAmount.value = transactions.reduce((total, t) => total + (t.amount || 0), 0)

      const filterByDate = (start: Date) => transactions.filter((t) => new Date(t.entrydt) >= start)

      totalTransactionCount.value = transactions.length
      dailyTransactionCount.value = filterByDate(startOfDay).length
      weeklyTransactionCount.value = filterByDate(startOfWeek).length
      monthlyTransactionCount.value = filterByDate(startOfMonth).length

      console.log('Total transaction amount:', totalTransactionAmount.value)
    } else {
      console.error('Error getting total transactions:', response.data)
    }
  } catch (error) {
    console.error('Error fetching total transactions:', error)
  }
}

// Get successful transactions
const getSuccessfulTransactions = async (): Promise<void> => {
  try {
    const reqData = { p_limit: 50 }

    const response = await axios.post(
      'https://api01-dev.quidly.ng/api/txdb/procedure/admin_AllMerchants_getSuccessfulTransactions',
      reqData
    )

    if (response.data.status === 1) {
      const transactions = response.data.jsresult as Transaction[]
      const successful = transactions.filter((t) => t.payment_status === 1)

      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const startOfWeek = new Date(startOfDay)
      startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay())
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      const computeAmount = (start: Date): number =>
        successful.reduce((total, t) => {
          const date = new Date(t.entrydt)
          return date >= start ? total + (t.amount || 0) : total
        }, 0)

      const totalAmount = successful.reduce((sum, t) => sum + (t.amount || 0), 0)

      totalSuccessfulTransactionAmount.value = totalAmount
      totalSuccessfulTransactionCount.value = successful.length

      console.log('Total successful transaction amount:', totalAmount)
      console.log('Daily:', computeAmount(startOfDay))
      console.log('Weekly:', computeAmount(startOfWeek))
      console.log('Monthly:', computeAmount(startOfMonth))
    } else {
      console.error('Error getting successful transactions:', response.data)
    }
  } catch (error) {
    console.error('Error fetching successful transactions:', error)
  }
}

const openCallbackDialog = (callback: CallbackRequest): void => {
  selectedCallback.value = callback
  showCallbackDialog.value = true
}

// -------------------------
// ✅ Computed Formatters
// -------------------------
const formattedDailyTotal = computed<string>(() => formatCurrency(dailyTotal.value))
const formattedWeeklyTotal = computed<string>(() => formatCurrency(weeklyTotal.value))
const formattedMonthlyTotal = computed<string>(() => formatCurrency(monthlyTotal.value))
const formattedTotalSuccessfulTransactionAmount = computed<string>(() =>
  formatCurrency(totalSuccessfulTransactionAmount.value)
)

// -------------------------
// ✅ Document Fetching & Verification
// -------------------------

// ✅ Fetch Uploaded Documents
// -------------------------
const fetchBusinessOwnerUpload = async (
  fileid: string | undefined | null
): Promise<string | null> => {
  if (!fileid) return null
  return `https://api01-dev.quidly.ng/api/getbusinessownerdocuments/${fileid}`
}

const fetchCompanyUpload = async (fileid: string | undefined | null): Promise<string | null> => {
  if (!fileid) return null
  return `https://api01-dev.quidly.ng/api/getcompanydocuments/${fileid}`
}

// -------------------------
// ✅ Open Merchant Dialog
// -------------------------
const openMerchantDialog = async (merchant: Merchant) => {
   console.log('Opening merchant dialog for:', merchant)
  selectedMerchant.value = merchant
  showMerchantDialog.value = true

  const photoDoc = (merchant as any).owner_documents?.find(
    (doc: any) => doc.uploadtypeid === 'photoidfile'
  )
  const poaDoc = (merchant as any).owner_documents?.find(
    (doc: any) => doc.uploadtypeid === 'poaddressfile'
  )
  const companyDoc = (merchant as any).company_documents?.find(
    (doc: any) => doc.uploadtypeid === 'businessdocument'
  )

  photoIdImage.value = photoDoc?.fileuploadid || null
  poaImage.value = poaDoc?.fileuploadid || null
  companyDocImage.value = companyDoc?.fileuploadid || null

  // Automatically fetch URLs
  filePhotoId.value = await fetchBusinessOwnerUpload(photoIdImage.value)
  filePoaImage.value = await fetchBusinessOwnerUpload(poaImage.value)
  fileCompanyDocumentImage.value = await fetchCompanyUpload(companyDocImage.value)
}


const handleViewPhotoId = async () => {
  if (!selectedMerchant.value?.photoid) return
  filePhotoId.value = await fetchBusinessOwnerUpload(selectedMerchant.value.photoid)
}

const handleViewPoa = async () => {
  if (!selectedMerchant.value?.poaid) return
  filePoaImage.value = await fetchBusinessOwnerUpload(selectedMerchant.value.poaid)
}

const handleViewCompanyDocs = async () => {
  if (!selectedMerchant.value?.companydocid) return
  fileCompanyDocumentImage.value = await fetchCompanyUpload(selectedMerchant.value.companydocid)
}

// -------------------------
// ✅ Verification Functions
// -------------------------

// Verify Photo ID
const verifyPhotoId = async (): Promise<void> => {
  if (!selectedMerchant.value || !filePhotoId.value) return
  const requestData = {
    p_accountid: selectedMerchant.value.accountid,
    p_merchantid: selectedMerchant.value.merchantid,
    p_fileuploadid: photoIdImage.value,
    p_status: 1,
    p_verifiedadminid: adminUserId
  }
  const response = await axios.post(
    'https://api01-dev.quidly.ng/api/mdb/procedure/updateStatus_UploadBusinessOwner',
    requestData
  )
  console.log('Verify Photo ID response:', response.data)
}

const verifyPoa = async (): Promise<void> => {
  if (!selectedMerchant.value || !filePoaImage.value) return
  const requestData = {
    p_accountid: selectedMerchant.value.accountid,
    p_merchantid: selectedMerchant.value.merchantid,
    p_fileuploadid: poaImage.value,
    p_status: 1,
    p_verifiedadminid: adminUserId
  }
  const response = await axios.post(
    'https://api01-dev.quidly.ng/api/mdb/procedure/updateStatus_UploadBusinessOwner',
    requestData
  )
  console.log('Verify POA response:', response.data)
}

const verifyCompanyDocs = async (): Promise<void> => {
  if (!selectedMerchant.value || !fileCompanyDocumentImage.value) return
  const requestData = {
    p_accountid: selectedMerchant.value.accountid,
    p_merchantid: selectedMerchant.value.merchantid,
    p_fileuploadid: companyDocImage.value,
    p_status: 1,
    p_verifiedadminid: adminUserId
  }
  const response = await axios.post(
    'https://api01-dev.quidly.ng/api/mdb/procedure/updateStatus_UploadCompanyDocs',
    requestData
  )
  console.log('Verify Company Document response:', response.data)
}

const fetchAll = async (): Promise<void> => {
  loading.value = true
  try {
    await Promise.all([
      fetchTotalMerchants(),
      fetchCallBackCount(),
      fetchTotalMerchantsCount(),
      fetchTotalTransactions(),
      getSuccessfulTransactions()
    ])
  } catch (err: any) {
    console.error('Error fetching all:', err.message)
  } finally {
    loading.value = false
  }
}

onMounted(fetchAll)
</script>

<template>
  <MainLayout>
    <div
      v-if="loading"
      class="fill-height d-flex justify-center align-center mx-auto items-center flex my-auto mx-auto"
    >
      <v-progress-circular indeterminate color="success" size="48" />
    </div>

    <div v-else>
      <!-- Transactions Section -->
      <div class="p-6 bg-gray-50">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Transactions -->
          <div class="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded shadow-md p-5">
            <p class="text-sm font-medium opacity-90">Total transactions</p>
            <div class="flex justify-between items-center py-2">
              <h4 class="text-xl font-semibold">{{ formatCurrency(totalTransactionAmount) }}</h4>
              <h4 class="text-xl font-semibold">{{ totalTransactionCount }}</h4>
            </div>
            <div class="flex justify-between text-sm opacity-80">
              <p>Value</p>
              <p>Count</p>
            </div>
          </div>

          <!-- Monthly Transactions -->
          <div
            class="bg-gradient-to-r from-green-600 to-green-800 text-white rounded shadow-md p-5"
          >
            <p class="text-sm font-medium opacity-90">Monthly transactions</p>
            <div class="flex justify-between items-center py-2">
              <h4 class="text-xl font-semibold">{{ formattedMonthlyTotal }}</h4>
              <h4 class="text-xl font-semibold">{{ monthlyTransactionCount }}</h4>
            </div>
            <div class="flex justify-between text-sm opacity-80">
              <p>Value</p>
              <p>Count</p>
            </div>
          </div>

          <!-- Weekly Transactions -->
          <div
            class="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded shadow-md p-5"
          >
            <p class="text-sm font-medium opacity-90">Weekly transactions</p>
            <div class="flex justify-between items-center py-2">
              <h4 class="text-xl font-semibold">{{ formattedWeeklyTotal }}</h4>
              <h4 class="text-xl font-semibold">{{ weeklyTransactionCount }}</h4>
            </div>
            <div class="flex justify-between text-sm opacity-80">
              <p>Value</p>
              <p>Count</p>
            </div>
          </div>

          <!-- Daily Transactions -->
          <div class="bg-gradient-to-r from-pink-600 to-pink-800 text-white rounded shadow-md p-5">
            <p class="text-sm font-medium opacity-90">Daily transactions</p>
            <div class="flex justify-between items-center py-2">
              <h4 class="text-xl font-semibold">{{ formattedDailyTotal }}</h4>
              <h4 class="text-xl font-semibold">{{ dailyTransactionCount }}</h4>
            </div>
            <div class="flex justify-between text-sm opacity-80">
              <p>Value</p>
              <p>Count</p>
            </div>
          </div>
        </div>

        <!-- Successful Transactions -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div
            class="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded shadow-md p-5"
          >
            <p class="text-sm font-medium opacity-90">Successful transactions</p>
            <div class="flex justify-between items-center py-2">
              <h4 class="text-xl font-semibold">₦2,320,000</h4>
              <h4 class="text-xl font-semibold">956</h4>
            </div>
            <div class="flex justify-between text-sm opacity-80">
              <p>Value</p>
              <p>Count</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Merchants & Callbacks Section -->
      <div class="p-6 bg-gray-50">
        <div class="p-4 bg-white rounded">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Total Merchants -->
            <div class="flex items-center justify-between p-4">
              <div>
                <h3 class="text-2xl font-semibold text-gray-900">{{ totalMerchantsCount }}</h3>
                <h5 class="text-blue-600 font-medium">Total Merchants</h5>
                <p class="text-sm text-gray-500">+14.00 (+0.50%)</p>
              </div>
              <div>
                <canvas id="chart1" width="100" height="50"></canvas>
              </div>
            </div>

            <!-- New Merchants -->
            <div class="flex items-center justify-between p-4">
              <div>
                <h3 class="text-2xl font-semibold text-gray-900">{{ totalMerchantsCount }}</h3>
                <h5 class="text-green-600 font-medium">New Merchants</h5>
                <p class="text-sm text-gray-500">+138.97 (+0.54%)</p>
              </div>
              <div>
                <canvas id="chart2" width="100" height="50"></canvas>
              </div>
            </div>

            <!-- Unverified Merchants -->
            <div class="flex items-center justify-between p-4">
              <div>
                <h3 class="text-2xl font-semibold text-gray-900">{{ totalMerchantsCount }}</h3>
                <h5 class="text-yellow-600 font-medium">Unverified Merchants</h5>
                <p class="text-sm text-gray-500">+57.62 (+0.76%)</p>
              </div>
              <div>
                <canvas id="chart3" width="100" height="50"></canvas>
              </div>
            </div>

            <!-- Callback Requests -->
            <div class="flex items-center justify-between p-4">
              <div>
                <h3 class="text-2xl font-semibold text-gray-900">{{ callBackRequestCount }}</h3>
                <h5 class="text-purple-600 font-medium">Callback Requests</h5>
                <p class="text-sm text-gray-500">+138.97 (+0.54%)</p>
              </div>
              <div>
                <canvas id="chart4" width="100" height="50"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Merchants and callbacks table -->
      <v-container fluid class="pa-4 bg-grey-lighten-5">
        <v-row>
          <!-- New Merchants Table -->
          <v-col cols="12" md="8">
            <v-card elevation="2" class="rounded-lg">
              <v-card-title class="text-md font-semibold">New Merchants</v-card-title>

              <v-table density="comfortable" class="text-sm">
                <thead>
                  <tr>
                    <th></th>
                    <th>Merchant Name</th>
                    <th>Company Reg No</th>
                    <th>Company Type</th>
                    <th>Business Email</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="merchant in merchants" :key="merchant.id">
                    <td>
                      <v-btn
                        color="primary"
                        variant="text"
                        size="small"
                        @click="openMerchantDialog(merchant)"
                      >
                        Review
                      </v-btn>
                    </td>
                    <td>{{ merchant.merchantname }}</td>
                    <td>{{ merchant.companyregno }}</td>
                    <td>{{ merchant.companytype }}</td>
                    <td>{{ merchant.business_email }}</td>
                    <td>{{ formatDate(merchant.entrydt) }}</td>
                  </tr>
                </tbody>
              </v-table>

              <div class="text-end pa-3">
                <v-pagination
                  color="primary"
                  v-model="merchantPage"
                  :length="5"
                  rounded="circle"
                  density="comfortable"
                />
              </div>
            </v-card>
          </v-col>

          <!-- Callback Requests Table -->
          <v-col cols="12" md="4">
            <v-card elevation="2" class="rounded-lg">
              <v-card-title class="text-md font-semibold">Callback Requests</v-card-title>

              <v-table density="comfortable" class="text-sm">
                <thead>
                  <tr>
                    <th></th>
                    <th>Phone Number</th>
                    <th>Date/Time</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="callback in callbacks" :key="callback.id">
                    <td>
                      <v-btn
                        color="deep-purple-accent-4"
                        variant="text"
                        size="small"
                        @click="openCallbackDialog(callback)"
                      >
                        Review
                      </v-btn>
                    </td>
                    <td>{{ callback.phoneno }}</td>
                    <td>{{ formatDate(callback.entrydt) }}</td>
                    <td>{{ callback.id }}</td>
                  </tr>
                </tbody>
              </v-table>

              <div class="text-end pa-3">
                <v-pagination
                  color="deep-purple-accent-4"
                  v-model="callbackPage"
                  :length="3"
                  rounded="circle"
                  density="comfortable"
                />
              </div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Merchant Review Dialog -->
        <v-dialog v-model="showMerchantDialog" max-width="700">
          <v-card>
            <v-card-title class="text-h6 font-weight-medium"> Review Merchant </v-card-title>
            <v-card-text>
              <div v-if="selectedMerchant">
                <p><strong>Merchant Name:</strong> {{ selectedMerchant.merchantname }}</p>
                <p><strong>Merchant ID:</strong> {{ selectedMerchant.merchantid }}</p>
                <p><strong>Business Address:</strong> {{ selectedMerchant.business_address }}</p>

                <v-divider class="my-3"></v-divider>

                <!-- View / Verify Buttons -->
                <div class="flex flex-col gap-3">
                  <div class="flex items-center justify-between">
                    <v-btn color="primary" variant="tonal" @click="handleViewPhotoId">
                      View Photo ID
                    </v-btn>
                    <v-btn color="success" variant="text" @click="verifyPhotoId">Verify</v-btn>
                  </div>

                  <div class="flex items-center justify-between">
                    <v-btn color="primary" variant="tonal" @click="handleViewPoa">
                      View Proof of Address
                    </v-btn>
                    <v-btn color="success" variant="text" @click="verifyPoa">Verify</v-btn>
                  </div>

                  <div class="flex items-center justify-between">
                    <v-btn color="primary" variant="tonal" @click="handleViewCompanyDocs">
                      View Company Documents
                    </v-btn>
                    <v-btn color="success" variant="text" @click="verifyCompanyDocs">
                      Verify
                    </v-btn>
                  </div>
                </div>

                <!-- Display fetched images -->
                <div
                 
                  class="mt-4 space-y-3"
                >
                  <div v-if="filePhotoId">
                    <p class="font-semibold text-gray-700">Photo ID</p>
                    <img
                      :src="filePhotoId || defaultPhotoId"
                      alt="Photo ID"
                      class="w-full rounded-lg shadow-md"
                    />
                  </div>
                  <div v-if="filePoaImage">
                    <p class="font-semibold text-gray-700">Proof of Address</p>
                    <img
                      :src="filePoaImage || defaultPoa"
                      alt="Proof of Address"
                      class="w-full rounded-lg shadow-md"
                    />
                  </div>
                  <div v-if="fileCompanyDocumentImage">
                    <p class="font-semibold text-gray-700">Company Documents</p>
                    <img
                      :src="fileCompanyDocumentImage || defaultCompanyDoc"
                      alt="Company Document"
                      class="w-full rounded-lg shadow-md"
                    />
                  </div>
                </div>

                <v-switch
                  v-model="verifyMerchant"
                  label="Mark Merchant as Verified"
                  color="success"
                  inset
                  class="mt-4"
                ></v-switch>
              </div>
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn variant="text" @click="showMerchantDialog = false">Close</v-btn>
              <v-btn color="primary">Save changes</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Callback Request Dialog -->
        <v-dialog v-model="showCallbackDialog" max-width="500">
          <v-card>
            <v-card-title class="text-h6 font-weight-medium">
              Review Callback Request
            </v-card-title>
            <v-card-text>
              <div v-if="selectedCallback">
                <p><strong>ID:</strong> {{ selectedCallback.id }}</p>
                <p><strong>Reason:</strong> {{ selectedCallback.callbackreason }}</p>
              </div>

              <v-textarea
                label="Enter notes here..."
                v-model="callbackNote"
                variant="outlined"
                rows="4"
                class="mt-3"
              ></v-textarea>
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn variant="text" @click="showCallbackDialog = false">Close</v-btn>
              <v-btn color="deep-purple-accent-4">Submit</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-container>
    </div>
  </MainLayout>
</template>

<style scoped>
.v-btn {
  text-transform: none;
}
</style>
