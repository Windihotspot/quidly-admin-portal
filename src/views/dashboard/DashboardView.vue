<script setup>
import { ref, onMounted, computed } from 'vue'
import MainLayout from '@/layouts/full/MainLayout.vue'
const loading = ref(false)

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value)
const formatDate = (date) => moment(date).format('DD MMM YYYY')

const merchantPage = ref(1)
const callbackPage = ref(1)
const showMerchantDialog = ref(false)
const showCallbackDialog = ref(false)
const selectedMerchant = ref(null)
const selectedCallback = ref(null)
const verifyMerchant = ref(false)
const callbackNote = ref('')

// Hardcoded merchants
const merchants = [
  {
    id: 1,
    merchantname: 'Alpha Traders Ltd',
    companyregno: 'RC-12345',
    companytype: 'Retail',
    business_email: 'contact@alpha.com',
    date: '2025-10-25',
    merchantid: 'M-001',
    business_address: '12 Palm Street, Lagos, Nigeria'
  },
  {
    id: 2,
    merchantname: 'BlueSky Ventures',
    companyregno: 'RC-78901',
    companytype: 'Tech',
    business_email: 'info@bluesky.io',
    date: '2025-10-24',
    merchantid: 'M-002',
    business_address: '45 Kings Road, Abuja, Nigeria'
  }
]

// Hardcoded callback requests
const callbacks = [
  {
    id: 1001,
    phoneno: '+2348021234567',
    datetime: '2025-10-28 14:35',
    callbackreason: 'Merchant approval inquiry'
  },
  {
    id: 1002,
    phoneno: '+2348059876543',
    datetime: '2025-10-27 09:15',
    callbackreason: 'Account verification issue'
  }
]

const openMerchantDialog = (merchant) => {
  selectedMerchant.value = merchant
  showMerchantDialog.value = true
}

const openCallbackDialog = (callback) => {
  selectedCallback.value = callback
  showCallbackDialog.value = true
}

const fetchAll = async () => {
  loading.value = true
  try {
    await Promise.all([])
  } catch (err) {
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
              <h4 class="text-xl font-semibold">₦2,540,000</h4>
              <h4 class="text-xl font-semibold">1,024</h4>
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
              <h4 class="text-xl font-semibold">₦520,000</h4>
              <h4 class="text-xl font-semibold">205</h4>
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
              <h4 class="text-xl font-semibold">₦130,000</h4>
              <h4 class="text-xl font-semibold">64</h4>
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
              <h4 class="text-xl font-semibold">₦18,500</h4>
              <h4 class="text-xl font-semibold">12</h4>
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
                <h3 class="text-2xl font-semibold text-gray-900">1,245</h3>
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
                <h3 class="text-2xl font-semibold text-gray-900">320</h3>
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
                <h3 class="text-2xl font-semibold text-gray-900">82</h3>
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
                <h3 class="text-2xl font-semibold text-gray-900">54</h3>
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
                    <td>{{ merchant.date }}</td>
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
                    <td>{{ callback.datetime }}</td>
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
        <v-dialog v-model="showMerchantDialog" max-width="600">
          <v-card>
            <v-card-title class="text-h6 font-weight-medium"> Review Merchant </v-card-title>
            <v-card-text>
              <div v-if="selectedMerchant">
                <p><strong>Merchant Name:</strong> {{ selectedMerchant.merchantname }}</p>
                <p><strong>Merchant ID:</strong> {{ selectedMerchant.merchantid }}</p>
                <p><strong>Business Address:</strong> {{ selectedMerchant.business_address }}</p>

                <v-divider class="my-3"></v-divider>

                <div class="flex flex-col gap-2">
                  <v-btn color="blue-darken-2" variant="text">View Photo ID</v-btn>
                  <v-btn color="blue-darken-2" variant="text">View Proof of Address</v-btn>
                  <v-btn color="blue-darken-2" variant="text">View Company Documents</v-btn>
                </div>

                <v-switch
                  v-model="verifyMerchant"
                  label="Verify Merchant"
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