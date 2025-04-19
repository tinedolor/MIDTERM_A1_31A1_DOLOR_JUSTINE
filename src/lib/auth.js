// Mock auth functions - replace with real API calls in production
export async function loginUser(email, password) {
    // In a real app, you would call your backend API here
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password.length >= 6) {
          localStorage.setItem('isAuthenticated', 'true')
          resolve()
        } else {
          reject(new Error('Invalid credentials'))
        }
      }, 1000)
    })
  }
  
  export async function registerUser(email, password) {
    // In a real app, you would call your backend API here
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password.length >= 6) {
          localStorage.setItem('isAuthenticated', 'true')
          resolve()
        } else {
          reject(new Error('Registration failed'))
        }
      }, 1000)
    })
  }
  
  export function isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true'
  }
  
  export function logout() {
    localStorage.removeItem('isAuthenticated')
  }