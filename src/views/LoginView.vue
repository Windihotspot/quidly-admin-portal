<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const showPassword = ref(false)
const loginFormRef = ref(null)

const email = ref('')
const password = ref('')
const remember = ref(false)
const processing = ref(false)

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const emailRules = [
  (v) => !!v || 'Email is required',
  (v) => /.+@.+\..+/.test(v) || 'Email must be valid'
]

const passwordRules = [(v) => !!v || 'Password is required']

// ---- LOGIN FUNCTION ----
const submitForm = async () => {
  const isValid = await loginFormRef.value?.validate()
  if (!isValid) return

  processing.value = true
  try {
    const user = await authStore.login(email.value, password.value)

    ElNotification({
      title: 'Success',
      message: `Welcome back, ${user.name}!`,
      type: 'success',
      duration: 3000,
      position: 'top-right',
    })

    router.push('/dashboard')
  } catch (err) {
    ElNotification({
      title: 'Login Failed',
      message: err.message || 'Unable to log in.',
      type: 'error',
      duration: 4000,
      position: 'top-right',
    })
  } finally {
    processing.value = false
  }
}
</script>


<template>
  <div class="flex flex-col md:flex-row h-auto h-screen bg-white">
    <!-- Login Form Section -->
    <div class="w-full pt-8 flex items-center justify-center bg-white h-full">
      <div class="max-w-md w-full px-4 sm:px-6 lg:px-8 py-8 md:py-0">
     
        <p class="text-gray-600 mt-2 text-center">
          Login to access your account
        </p>

        <!-- Vuetify Form -->
        <v-form ref="loginFormRef" @submit.prevent="submitForm" class="mt-6 space-y-4">
          <!-- Global Form Error -->

          <!-- Email Field -->
          <v-text-field
            v-model="email"
            label="Email address"
            variant="outlined"
            color="#214ec8"
            :rules="emailRules"
            required
          />

          <!-- Password Field -->
          <v-text-field
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            variant="outlined"
            color="#214ec8"
            :rules="passwordRules"
            required
          >
            <template #append-inner>
              <i
                :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                @click="togglePasswordVisibility"
                class="cursor-pointer text-black"
              ></i>
            </template>
          </v-text-field>

          <!-- Remember me and Forgot -->
          <div class="flex items-center justify-between">
            <label class="flex items-center space-x-2">
              <el-checkbox v-model="remember" size="large" />
              <span class="text-sm text-gray-700">Remember me</span>
            </label>

            <v-btn
              no-uppercase
              variant="text"
              size="small"
              color="#214ec8"
              class="normal-case text-none"
            >
              Forgot password?
            </v-btn>
          </div>

          <!-- Submit Button -->
          <v-btn
            type="submit"
            :loading="processing"
            :disabled="!email || !password || processing"
            :class="{
              'custom-btn-disabled': !email || !password || processing
            }"
            class="w-full text-white font-semibold text-sm custom-btn"
            height="40"
          >
            {{ processing ? 'Signing in...' : 'Sign in' }}
          </v-btn>
        </v-form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-btn {
  background-color: #214ec8;
}
.v-btn {
  text-transform: none;
}
.custom-btn-disabled {
  background-color: #214ec8 !important; /* Light blue-gray */
  color: #ffffff !important;
  opacity: 1 !important; /* prevent Vuetify from reducing visibility */
  cursor: not-allowed;
}
</style>
