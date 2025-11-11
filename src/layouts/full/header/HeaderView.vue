<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import quidlyLogo from '@/assets/images/quidly(q).png'

// Notification menu state
const notifMenu = ref(false)
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const user = computed(() => authStore.user)
const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="header items-center px-4 py-4 bg-white">
    <!-- Icons (Right) -->
    <div class="space-x-4 flex">
      <!-- Notification Icon -->
       <v-menu
        v-model="notifMenu"
        offset-y
        location="bottom right"
        origin="top right"
        min-width="300"
      >
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon variant="text" class="hover:bg-green-100">
            <i class="fas fa-bell text-gray-600 text-3xl"></i>
          </v-btn>
        </template>

        <!-- Notification Content -->
        <v-card>
          <v-card-title class="text-xs">Notifications</v-card-title>
          <v-divider></v-divider>
          <v-list class="max-h-60 overflow-y-auto">
            
          </v-list>
        </v-card>
      </v-menu>
      <v-menu offset-y location="bottom left" origin="top left" min-width="200">
        <template v-slot:activator="{ props }">
          <div
            v-bind="props"
            class="flex items-center cursor-pointer bg-white rounded-md px-2 py-1 hover:bg-gray-100 transition"
          >
            <v-avatar size="40" class="border border-red-500">
              <v-img :src="quidlyLogo" cover></v-img>
            </v-avatar>
            <div class="ml-2 text-left">
              <div class="font-semibold text-black text-sm">Quidly</div>
              <div class="text-xs text-gray-500">{{ }}</div>
            </div>
          </div>
        </template>

        <v-list>
          <!-- <v-list-item
            
            link
            class="text-gray-700 hover:text-black-500"
          >
            <div class="flex items-center gap-2">
              <i class="fas fa-user text-gray-500 hover:text-gray-500"></i>
              <v-list-item-title>Profile</v-list-item-title>
            </div>
          </v-list-item> -->
          <v-list-item @click="handleLogout" link class="text-gray-700 hover:text-red-500">
            <div class="flex items-center gap-2">
              <i class="fas fa-sign-out-alt text-gray-500 hover:text-red-500"></i>
              <v-list-item-title>Logout</v-list-item-title>
            </div>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<style scoped>
v-btn {
  text-transform: none;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.icons-container {
  display: flex;
  justify-content: flex-end;
  flex-grow: 1;
}

.search {
  flex-grow: 0;
}
</style>
