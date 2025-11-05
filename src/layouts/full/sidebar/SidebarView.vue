<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import sidebarItems from './sidebarItem'
import { useRoute, useRouter } from 'vue-router'
import { gsap } from 'gsap'
import quidlyLogo from '@/assets/images/quidly(q).png'

const route = useRoute()
const router = useRouter()
const sidebarRef = ref<HTMLElement | null>(null)
const buttonRefs = ref<HTMLElement[]>([]) // for all sidebar buttons

// Filter items (can add role-based logic later)
const filteredSidebar = computed(() => sidebarItems)

// Check if route is active
const isActive = (path: string) => route.path === path

// Animate sidebar entrance
onMounted(async () => {
  await nextTick()

  gsap.from(sidebarRef.value, {
    x: -100,
    y: -50,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
  })

  // Animate in each button sequentially
  gsap.from(buttonRefs.value, {
    x: -20,
    opacity: 0,
    stagger: 0.08,
    ease: 'power2.out',
    duration: 0.4,
  })
})

// Hover animation handlers
const onHover = (index: number) => {
  gsap.to(buttonRefs.value[index], {
    scale: 1.05,
    backgroundColor: '#f1f5ff', // light hover color
    duration: 0.2,
    ease: 'power2.out',
  })
}

const onLeave = (index: number, isActiveItem: boolean) => {
  gsap.to(buttonRefs.value[index], {
    scale: 1,
    backgroundColor: isActiveItem ? 'rgba(21,128,61,0.1)' : '#fff',
    duration: 0.25,
    ease: 'power2.inOut',
  })
}

// Optional: subtle pulse or shine when active
const animateActive = (index: number) => {
  const el = buttonRefs.value[index]
  if (!el) return

  const tl = gsap.timeline()
  tl.to(el, { scale: 1.05, duration: 0.15, ease: 'power2.out' })
    .to(el, { scale: 1, duration: 0.2, ease: 'power2.inOut' })
}
</script>


<template>
  <div ref="sidebarRef" class="side-bar mt-4 d-flex flex-column h-full justify-between overflow-hidden">
    <!-- Logo -->
    <div class="flex items-center space-x-3 p-6">
      <div class="w-9 h-9 rounded-full overflow-hidden">
        <img :src="quidlyLogo" alt="Avatar" class="w-full h-full object-cover" />
      </div>
      <div class="text-left">
        <p class="font-semibold">Quidly</p>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex-grow">
      <v-list class="pa-2">
        <template v-for="(item, i) in filteredSidebar" :key="i">
          <v-list-item
            ref="buttonRefs"
            @click="() => { router.push(item.path); animateActive(i) }"
            @mouseenter="onHover(i)"
            @mouseleave="onLeave(i, isActive(item.path))"
            class="mb-4 custom-btn no-uppercase relative"
            size="small"
            rounded="lg"
            block
            :class="{ 'custom-active': isActive(item.path) }"
          >
            <div class="flex items-center w-full">
              <v-icon left>{{ item.icon }}</v-icon>
              <span class="menu-item ml-4" v-text="item.title"></span>
            </div>
          </v-list-item>
        </template>
      </v-list>
    </div>
  </div>
</template>


<style scoped>
.side-bar {
  width: 250px;
  position: fixed;
  top: 0;
  left: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
}

.logout-btn:hover {
  background-color: #ffecec;
}

.logo {
  width: 50%;
}
.menu-item {
  font-size: 12px;
  text-transform: none;
  color: #1e1e1e;
}

.custom-btn:hover {
  background-color: #e8f0fe;
}

.custom-btn {
  text-align: left;
  justify-content: flex-start;
  transition: background-color 0.2s ease;
}
.custom-btn .v-icon {
  margin-right: 8px;
  color: #1e1e1e;
}
.custom-btn .menu-item {
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Helvetica,
    Arial,
    sans-serif,
    'Apple Color Emoji',
    'Segoe UI Emoji';
  font-style: normal;
  font-weight: 500;
  font-size: 13px;
  line-height: 28px;
}
.custom-link {
  text-decoration: none; /* Remove underline from Link */
}

.custom-active {
  color: #214ec8 !important; /* Active state color */
  background-color: rgba(21, 128, 61, 0.1); /* Light green background matching the text */
  border-radius: 12px;
  position: relative;
  overflow: visible;
}

.custom-active .menu-item {
  color: #214ec8 !important;
}

.custom-active .v-icon {
  color: #214ec8 !important;
}
.active-bar {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  width: 4px;
  height: 40px; /* Adjust to match your button height */
  background-color: #214ec8;
  border-radius: 8px;
}
.custom-active::after {
  content: '';
  position: absolute;
  right: -4px;
  top: 12px;
  bottom: 12px;
  width: 4px;
  background-color: #214ec8; /* Blue vertical bar */
  border-radius: 4px;
}
::v-deep(.custom-active::after) {
  content: '';
  position: absolute;
  top: 8px;
  bottom: 8px;
  right: -4px;
  width: 4px;
  background-color: #214ec8;
  border-radius: 4px;
}
</style>
