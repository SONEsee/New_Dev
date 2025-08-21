import { defineStore } from 'pinia'
import { UserModel } from "@/models"
import axios from "@/helpers/axios"
import { CallSwal } from "~/composables/global"

interface UserFormData {
  user_id: string
  user_name: string
  user_email: string
  user_mobile: string
  user_password: string
  div_id: string
  user_status: boolean
  Maker_Id: string
  muth_status: string
  profile_picture: File | string | null
  Role_ID: string
  Auth_Status: string
  pwd_changed_on: string
}

interface UserQueryParams {
  div_id?: string | null
  role_id?: string | null
}

export const UserStore = defineStore("user", {
  state() {
    return {
      // Form data for creating new users
      create_user_form: {
        user_id: "",
        user_name: "",
        user_email: "",
        user_mobile: "",
        user_password: "",
        div_id: "",
        user_status: true,
        Maker_Id: "",
        muth_status: "",
        profile_picture: null,
        Role_ID: "",
        Auth_Status: "A", // Default to Active
        pwd_changed_on: "",
      } as UserFormData,

      // Form data for updating existing users  
      update_user_form: {
        user_id: "",
        user_name: "",
        user_email: "",
        user_mobile: "",
        user_password: "",
        div_id: "",
        user_status: true,
        Maker_Id: "",
        muth_status: "",
        profile_picture: null,
        Role_ID: "",
        Auth_Status: "",
        pwd_changed_on: "",
      } as UserFormData,

      // User list and details
      userList: [] as UserModel.Items[],
      respone_data_detail: null as UserModel.Items | null,
      
      // Query parameters for filtering
      request_get_user: {
        query: {
          div_id: null,
          role_id: null,
        } as UserQueryParams,
        loading: false,
      },

      // Global loading state
      loading: false,
    }
  },

  getters: {
    /**
     * Get formatted user list for display
     */
    formattedUserList: (state) => {
      return state.userList.map(user => ({
        ...user,
        display_name: `${user.user_name} (${user.user_id})`,
        status_display: user.Auth_Status === 'A' ? 'ເປີດໃຊ້ງານ' : 'ປິດໃຊ້ງານ',
        division_name: user.division?.division_name_la || 'ບໍ່ລະບຸ',
        role_name: user.role?.role_name_la || 'ບໍ່ລະບຸ'
      }))
    },

    /**
     * Check if user detail is loaded
     */
    hasUserDetail: (state) => !!state.respone_data_detail,

    /**
     * Get profile image URL with fallback
     */
    profileImageUrl: (state) => {
      const detail = state.respone_data_detail
      const updateForm = state.update_user_form
      
      // Priority: new uploaded file > existing profile_picture > default
      if (updateForm.profile_picture instanceof File) {
        return URL.createObjectURL(updateForm.profile_picture)
      }
      
      if (detail?.profile_picture) {
        return detail.profile_picture
      }
      
      return '/assets/img/404.png' // Default fallback
    }
  },

  actions: {
    /**
     * Fetch user list with optional filtering
     */
    async GetUser(): Promise<void> {
      this.loading = true
      this.request_get_user.loading = true
      
      try {
        const response = await axios.get('/api/users/', {
          params: this.request_get_user.query,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (response.status === 200) {
          // Handle different response structures
          if (response.data?.Item && Array.isArray(response.data.Item)) {
            this.userList = response.data.Item
          } else if (Array.isArray(response.data)) {
            this.userList = response.data
          } else if (response.data?.items && Array.isArray(response.data.items)) {
            this.userList = response.data.items
          } else {
            // Fallback: find first array property
            for (const key in response.data) {
              if (Array.isArray(response.data[key])) {
                this.userList = response.data[key]
                break
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        this.userList = []
        
        await CallSwal({
          title: "ຜິດພາດ",
          text: "ບໍ່ສາມາດດຶງຂໍ້ມູນຜູ້ໃຊ້ໄດ້",
          icon: "error",
          timer: 2000
        })
      } finally {
        this.loading = false
        this.request_get_user.loading = false
      }
    },

    /**
     * Get detailed user information by ID
     */
    async GetdatadetailUser(user_id: string): Promise<void> {
      if (!user_id) {
        console.warn('User ID is required')
        return
      }

      this.loading = true
      
      try {
        const response = await axios.get<UserModel.Items>(`/api/users/${user_id}/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if (response.status === 200) {
          this.respone_data_detail = response.data
        }
      } catch (error: any) {
        console.error('Error fetching user details:', error)
        
        let errorMessage = 'ບໍ່ສາມາດດຶງຂໍ້ມູນຜູ້ໃຊ້ໄດ້'
        
        if (error.response?.status === 404) {
          errorMessage = 'ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້'
        } else if (error.response?.status === 403) {
          errorMessage = 'ທ່ານບໍ່ມີສິດເຂົ້າເບິ່ງຂໍ້ມູນນີ້'
        }

        await CallSwal({
          title: "ຜິດພາດ",
          text: errorMessage,
          icon: "error",
          timer: 2000
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * Create a new user
     */
    async CreatUser(): Promise<any> {
      this.loading = true
      
      try {
        // Validate required fields
        const requiredFields = ['user_id', 'user_name', 'user_mobile', 'user_password', 'div_id', 'Role_ID']
        const missingFields = requiredFields.filter(field => !this.create_user_form[field as keyof UserFormData])
        
        if (missingFields.length > 0) {
          await CallSwal({
            title: "ຂໍ້ມູນບໍ່ຄົບຖ້ວນ",
            text: "ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນ",
            icon: "warning",
            timer: 2000,
          })
          return null
        }

        // Prepare form data
        const formData = this._prepareFormData(this.create_user_form)

        const response = await axios.post('/api/users/', formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if ([200, 201].includes(response.status)) {
          await CallSwal({
            title: "ສຳເລັດ",
            text: "ເພີ່ມຂໍ້ມູນຜູ້ໃຊ້ສຳເລັດ",
            icon: "success",
            timer: 1500,
          })
          
          this.resetCreateForm()
          await this.GetUser()
          navigateTo('/user')
          
          return response.data
        }
      } catch (error: any) {
        console.error('Error creating user:', error)
        await this._handleError(error, 'ເພີ່ມຂໍ້ມູນຜູ້ໃຊ້')
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * Update existing user
     */
    async UpdateUser(user_id: string): Promise<any> {
      if (!user_id) {
        console.warn('User ID is required for update')
        return null
      }

      this.loading = true
      
      try {
        // Prepare form data
        const formData = this._prepareFormData(this.update_user_form, true)

        const response = await axios.put(`/api/users/${user_id}/`, formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if ([200, 204].includes(response.status)) {
          await CallSwal({
            title: "ສຳເລັດ",
            text: "ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ສຳເລັດ",
            icon: "success",
            timer: 1500,
          })
          
          await this.GetUser()
          navigateTo('/user')
          
          return response.data
        }
      } catch (error: any) {
        console.error('Error updating user:', error)
        await this._handleError(error, 'ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້')
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * Update current user profile (for self-update)
     */
    async UpdateMyUser(user_id: string): Promise<any> {
      if (!user_id) {
        console.warn('User ID is required for profile update')
        return null
      }

      this.loading = true
      
      try {
        // For self-update, we might have different status mapping
        const formData = this._prepareFormData(this.update_user_form, true)
        
        // Override status mapping for self-update if needed
        const authStatus = this.update_user_form.Auth_Status
        if (authStatus === "ເປີດ") {
          formData.set("Auth_Status", "A")
        } else if (authStatus === "ປິດ") {
          formData.set("Auth_Status", "I") // Inactive instead of U for self-update
        }

        const response = await axios.put(`/api/users/${user_id}/`, formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if ([200, 204].includes(response.status)) {
          await CallSwal({
            title: "ສຳເລັດ",
            text: "ແກ້ໄຂຂໍ້ມູນສ່ວນຕົວສຳເລັດ",
            icon: "success",
            timer: 1500,
          })
          
          navigateTo('/myuser')
          
          return response.data
        }
      } catch (error: any) {
        console.error('Error updating profile:', error)
        await this._handleError(error, 'ແກ້ໄຂຂໍ້ມູນສ່ວນຕົວ')
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete user
     */
    async DeleteUser(user_id: string): Promise<any> {
      if (!user_id) {
        console.warn('User ID is required for deletion')
        return null
      }

      this.loading = true
      
      try {
        const response = await axios.delete(`/api/users/${user_id}/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if ([200, 204, 301].includes(response.status)) {
          await CallSwal({
            title: "ສຳເລັດ",
            text: "ລຶບຂໍ້ມູນຜູ້ໃຊ້ສຳເລັດ",
            icon: "success",
            timer: 1500,
          })
          
          await this.GetUser()
          
          return response.data
        }
      } catch (error: any) {
        console.error('Error deleting user:', error)
        
        let errorMessage = "ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນ"
        
        if (error.response?.status === 404) {
          errorMessage = "ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້"
        } else if (error.response?.status === 403) {
          errorMessage = "ທ່ານບໍ່ມີສິດໃນການລຶບຂໍ້ມູນນີ້"
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }

        await CallSwal({
          title: "ຜິດພາດ",
          text: errorMessage,
          icon: "error",
          timer: 2000,
        })
        
        return null
      } finally {
        this.loading = false
      }
    },

    /**
     * Reset create form to initial state
     */
    resetCreateForm(): void {
      this.create_user_form = {
        user_id: "",
        user_name: "",
        user_email: "",
        user_mobile: "",
        user_password: "",
        div_id: "",
        user_status: true,
        Maker_Id: "",
        Auth_Status: "A",
        Role_ID: "",
        profile_picture: null,
        muth_status: "",
        pwd_changed_on: "",
      }
    },

    /**
     * Reset update form to initial state
     */
    resetUpdateForm(): void {
      this.update_user_form = {
        user_id: "",
        user_name: "",
        user_email: "",
        user_mobile: "",
        user_password: "",
        div_id: "",
        user_status: true,
        Maker_Id: "",
        Auth_Status: "",
        Role_ID: "",
        profile_picture: null,
        muth_status: "",
        pwd_changed_on: "",
      }
    },

    /**
     * Set filter parameters for user list
     */
    setUserFilter(filters: Partial<UserQueryParams>): void {
      this.request_get_user.query = {
        ...this.request_get_user.query,
        ...filters
      }
    },

    /**
     * Clear all filters
     */
    clearFilters(): void {
      this.request_get_user.query = {
        div_id: null,
        role_id: null,
      }
    },

    /**
     * Private method to prepare FormData for API requests
     */
    _prepareFormData(formData: UserFormData, isUpdate: boolean = false): FormData {
      const data = new FormData()
      
      // Basic fields
      data.append('user_id', formData.user_id)
      data.append('user_name', formData.user_name)
      data.append('user_email', formData.user_email || '')
      data.append('user_mobile', formData.user_mobile)
      data.append('div_id', formData.div_id)
      data.append('Role_ID', formData.Role_ID)

      // Password handling - only include if provided
      if (formData.user_password && formData.user_password.trim() !== '') {
        data.append('user_password', formData.user_password)
      }

      // Status mapping
      let authStatus = formData.Auth_Status
      if (authStatus === "ເປີດ" || authStatus === "ເປີດໃຊ້ງານ") {
        authStatus = "A"
      } else if (authStatus === "ປິດ" || authStatus === "ປິດໃຊ້ງານ") {
        authStatus = "U"
      }
      data.append('Auth_Status', authStatus)
      data.append('user_status', authStatus === "A" ? 'true' : 'false')

      // Profile image handling
      if (formData.profile_picture instanceof File) {
        data.append('profile_picture', formData.profile_picture) // Use backend field name
      }

      return data
    },

    /**
     * Private method to handle API errors consistently
     */
    async _handleError(error: any, operation: string): Promise<void> {
      let errorMessage = `ເກີດຂໍ້ຜິດພາດໃນການ${operation}`
      
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.user_id) {
          errorMessage = `ຂໍ້ຜິດພາດທີ່ລະຫັດຜູ້ໃຊ້: ${error.response.data.user_id}`
        } else if (typeof error.response.data === 'object') {
          // Get first error from response
          const firstErrorKey = Object.keys(error.response.data)[0]
          if (firstErrorKey && error.response.data[firstErrorKey]) {
            const errorValue = Array.isArray(error.response.data[firstErrorKey]) 
              ? error.response.data[firstErrorKey][0]
              : error.response.data[firstErrorKey]
            errorMessage = `${firstErrorKey}: ${errorValue}`
          }
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      await CallSwal({
        title: "ຜິດພາດ",
        text: errorMessage,
        icon: "error",
        timer: 3000,
      })
    }
  },
})