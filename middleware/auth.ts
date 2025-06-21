// export default defineNuxtRouteMiddleware((to, from) => {
//   const token = localStorage.getItem("token");
//   const user = localStorage.getItem("user");
  
//   if (!token || !user) {
//     return navigateTo({
//       path: "/login",
//       query: {
//         redirect: to.fullPath,
//       },
//     });
//   }
// });


export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip auth check for public routes
  const publicRoutes = ['/login', '/register', '/forgot-password', '/']
  if (publicRoutes.includes(to.path)) {
    return
  }

  // Check if user has token
  const token = process.client ? localStorage.getItem('token') : null
  
  if (!token) {
    return navigateTo('/login')
  }

  // Optional: Verify token is still valid
  if (process.client) {
    try {
      const response = await fetch('/api/verify-token/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        // Token is invalid or user was force logged out
        localStorage.removeItem('token')
        localStorage.removeItem('refresh')
        localStorage.removeItem('user')
        
        // Check if it's a force logout
        const data = await response.json().catch(() => ({}))
        if (data.error?.includes('session has been terminated')) {
          alert('Your session has been terminated by an administrator. Please login again.')
        }
        
        return navigateTo('/login')
      }
    } catch (error) {
      console.error('Auth verification error:', error)
      // Allow navigation but log the error
    }
  }
})