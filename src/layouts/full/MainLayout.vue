<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import HeaderView from './header/HeaderView.vue'
import SidebarView from './sidebar/SidebarView.vue'

const router = useRouter()

const drawer = ref()
const innerW = window.innerWidth

// Simulate password changed 25 days ago (for testing)
// userStore.user.password_changed_at = dayjs().subtract(25, 'day').toISOString()

onMounted(() => {
  if (innerW < 950) {
    drawer.value = !drawer.value
  }
})
</script>

<template>
  <v-app>
    <!--- Header -->
    <!-- ---------------------------------------------- -->
    <v-app-bar app elevation="1" class="pa-2">
      <v-btn class="hidden-md-and-up" icon @click="drawer = !drawer">
        <i class="fa-solid fa-bars"></i>
      </v-btn>

      <div class="logo pa-6">
        <!-- <p class="font-semibold text-lg">FlowkyAi</p> -->
        <!-- <img src="/src/assets/images/white.png" class="" /> -->
      </div>
      <v-spacer></v-spacer>
      <HeaderView />
    </v-app-bar>
    <!-- ---------------------------------------------- -->
    <!--- Sidebar -->
    <!-- ---------------------------------------------- -->
    <v-navigation-drawer
      left
      :permanent="$vuetify.display.mdAndUp"
      elevation="1"
      app
      :temporary="$vuetify.display.mdAndDown"
      v-model="drawer"
      expand-on-hover
      class="side-bar"
    >
      <SidebarView />
    </v-navigation-drawer>

    <!-- ---------------------------------------------- -->

    <!-- ---------------------------------------------- -->
    <!--- Page Wrapper -->
    <!-- ---------------------------------------------- -->

    <v-main class="mt-4 page-wrapper">
      <v-container fluid class="page-wrapper">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.v-btn {
  text-transform: none;
}
.side-bar {
  overflow: hidden !important;
}

.side-bar::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}

.page-wrapper {
  background-color: #f5f7f9;
}

.settings-icon {
  position: fixed;
  bottom: 16px;
  right: 16px;
  font-size: 36px;
  color: #121621;
  animation: rotate 5s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.slide-down-enter-active {
  animation: slideDown 0.4s ease-out;
}
.slide-down-leave-active {
  animation: slideUp 0.3s ease-in forwards;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-20px);
  }
}
/* Beautiful gradient style */
.password-banner {
  background: linear-gradient(90deg, #ff9800, #f44336);
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}
</style>
