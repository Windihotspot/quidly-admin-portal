import { defineStore } from 'pinia'
import users from '@/data/users.json' // path to your local JSON file

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userRole: (state) => state.user?.role || null,
  },

  actions: {
     async login(email, password) {
      const response = await fetch('/users.json')
      const users = await response.json()

      const foundUser = users.find(
        (u) => u.email === email && u.password === password
      )

      if (!foundUser) {
        throw new Error('Invalid email or password')
      }

      this.user = foundUser
      localStorage.setItem('user', JSON.stringify(foundUser))

      // ✅ return the user here!
      return foundUser
    },


    logout() {
      this.user = null
      localStorage.removeItem('user')
    },
  },
})
