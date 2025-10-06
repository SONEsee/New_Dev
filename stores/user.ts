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
  auth_status?: string | null
  search?: string | null
  page?: number
  page_size?: number
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
        Auth_Status: "U", // Default to Unapproved
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
          auth_status: null,
          search: null,
          page: 1,
          page_size: 20,
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
        status_display: user.Auth_Status === 'A' ? 'ອະນຸມັດແລ້ວ' : 'ລໍຖ້າອະນຸມັດ',
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
      
      return '/assets/img/404.png'
    },

    /**
     * Get create form profile image URL
     */
    createProfileImageUrl: (state) => {
      if (state.create_user_form.profile_picture instanceof File) {
        return URL.createObjectURL(state.create_user_form.profile_picture)
      }
      return '/assets/img/404.png'
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
          // Handle paginated response (DRF format)
          if (response.data?.results && Array.isArray(response.data.results)) {
            this.userList = response.data.results
          } 
          // Handle direct array response
          else if (Array.isArray(response.data)) {
            this.userList = response.data
          }
          // Handle custom response format
          else if (response.data?.Item && Array.isArray(response.data.Item)) {
            this.userList = response.data.Item
          } 
          else if (response.data?.items && Array.isArray(response.data.items)) {
            this.userList = response.data.items
          } 
          else {
            this.userList = []
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
          
          // Populate update form with fetched data
          this.update_user_form = {
            user_id: response.data.user_id || "",
            user_name: response.data.user_name || "",
            user_email: response.data.user_email || "",
            user_mobile: response.data.user_mobile || "",
            user_password: "", // Never populate password
            div_id: response.data.division?.div_id || response.data.div_id || "",
            user_status: response.data.User_Status === 'E',
            Maker_Id: response.data.Maker_Id || "",
            muth_status: "",
            profile_picture: response.data.profile_picture || null,
            Role_ID: response.data.role?.role_id || response.data.Role_ID || "",
            Auth_Status: response.data.Auth_Status || "U",
            pwd_changed_on: response.data.pwd_changed_on || "",
          }
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
        const formData = this._prepareFormData(this.create_user_form, false)

        const response = await axios.post('/api/users/', formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })

        // Handle both response formats:
        // 1. Wrapped: { success: true, message: '...', data: {...} }
        // 2. Direct: { user_id: '...', user_name: '...', ... }
        if ([200, 201].includes(response.status)) {
          // Check if success is explicitly false (error case)
          if (response.data.success === false) {
            throw new Error(response.data.message || 'ເກີດຂໍ້ຜິດພາດ')
          }
          
          // Otherwise, treat as success
          await CallSwal({
            title: "ສຳເລັດ",
            text: response.data.message || "ສ້າງຜູ້ໃຊ້ງານສຳເລັດແລ້ວ",
            icon: "success",
            timer: 1500,
          })
          
          this.resetCreateForm()
          await this.GetUser()
          navigateTo('/user')
          
          return response.data.data || response.data
        }
      } catch (error: any) {
        console.error('Error creating user:', error)
        await this._handleError(error, 'ສ້າງຜູ້ໃຊ້ງານ')
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
        const formData = this._prepareFormData(this.update_user_form, true)

        const response = await axios.patch(`/api/users/${user_id}/`, formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })

        if ([200, 204].includes(response.status)) {
          if (response.data?.success !== false || response.status === 204) {
            await CallSwal({
              title: "ສຳເລັດ",
              text: response.data?.message || "ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ງານສຳເລັດແລ້ວ",
              icon: "success",
              timer: 1500,
            })
            
            await this.GetUser()
            navigateTo('/user')
            
            return response.data?.data || response.data
          } else {
            throw new Error(response.data.message || 'ເກີດຂໍ້ຜິດພາດ')
          }
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
        const formData = this._prepareFormData(this.update_user_form, true)

        const response = await axios.patch(`/api/users/${user_id}/`, formData, {
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
          
          return response.data?.data || response.data
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
     * Delete user (soft delete)
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

        if ([200, 204].includes(response.status)) {
          if (response.data?.success !== false || response.status === 204) {
            await CallSwal({
              title: "ສຳເລັດ",
              text: response.data?.message || "ລຶບຂໍ້ມູນຜູ້ໃຊ້ສຳເລັດ",
              icon: "success",
              timer: 1500,
            })
            
            await this.GetUser()
            return response.data
          }
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
     * Update record status (enable user)
     */
    async updateRecordStatus(user_id: string): Promise<boolean> {
      try {
        const response = await axios.patch(
          `/api/users/${user_id}/`,
          { User_Status: 'E' },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        )

        if (response.data.success !== false) {
          await CallSwal({
            icon: 'success',
            title: 'ສຳເລັດ',
            text: 'ເປີດໃຊ້ງານຜູ້ໃຊ້ສຳເລັດແລ້ວ',
            timer: 1500,
            showConfirmButton: false,
          })
          return true
        }
        return false
      } catch (error) {
        console.error('Error updating status:', error)
        return false
      }
    },

    /**
     * Update record status (disable user)
     */
    async updateRecordStatusOff(user_id: string): Promise<boolean> {
      try {
        const response = await axios.patch(
          `/api/users/${user_id}/`,
          { User_Status: 'D' },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        )

        if (response.data.success !== false) {
          await CallSwal({
            icon: 'success',
            title: 'ສຳເລັດ',
            text: 'ປິດໃຊ້ງານຜູ້ໃຊ້ສຳເລັດແລ້ວ',
            timer: 1500,
            showConfirmButton: false,
          })
          return true
        }
        return false
      } catch (error) {
        console.error('Error updating status:', error)
        return false
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
        Auth_Status: "U",
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
        auth_status: null,
        search: null,
        page: 1,
        page_size: 20,
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
      data.append('user_mobile', formData.user_mobile)
      data.append('div_id', formData.div_id)
      data.append('Role_ID', formData.Role_ID)

      // Email - optional
      if (formData.user_email && formData.user_email.trim() !== '') {
        data.append('user_email', formData.user_email)
      }

      // Password - only include if provided (required for create, optional for update)
      if (formData.user_password && formData.user_password.trim() !== '') {
        data.append('user_password', formData.user_password)
      }

      // Status mapping - handle Lao text or status codes
      let authStatus = formData.Auth_Status
      if (authStatus === "ເປີດ" || authStatus === "ເປີດໃຊ້ງານ" || authStatus === "ອະນຸມັດແລ້ວ") {
        authStatus = "A"
      } else if (authStatus === "ປິດ" || authStatus === "ປິດໃຊ້ງານ" || authStatus === "ລໍຖ້າອະນຸມັດ" || authStatus === "ຍັງບໍ່ອະນຸມັດ") {
        authStatus = "U"
      }
      data.append('Auth_Status', authStatus)

      // Profile picture - only append if it's a new file
      if (formData.profile_picture instanceof File) {
        data.append('profile_picture', formData.profile_picture)
      }

      return data
    },

    /**
     * Private method to handle API errors consistently
     */
    async _handleError(error: any, operation: string): Promise<void> {
      let errorMessage = `ເກີດຂໍ້ຜິດພາດໃນການ${operation}`
      
      // Handle new backend error format
      if (error.response?.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message
        } else if (error.response.data.errors) {
          // Extract first error from errors object
          const errors = error.response.data.errors
          const firstErrorKey = Object.keys(errors)[0]
          if (firstErrorKey && errors[firstErrorKey]) {
            const errorValue = Array.isArray(errors[firstErrorKey]) 
              ? errors[firstErrorKey][0]
              : errors[firstErrorKey]
            
            // Map field names to Lao
            const fieldMap: Record<string, string> = {
              'user_id': 'ລະຫັດຜູ້ໃຊ້',
              'user_name': 'ຊື່ຜູ້ໃຊ້',
              'user_email': 'ອີເມວ',
              'user_mobile': 'ເບີໂທລະສັບ',
              'user_password': 'ລະຫັດຜ່ານ',
              'div_id': 'ພະແນກ',
              'Role_ID': 'ສິດການນຳໃຊ້',
            }
            
            const fieldName = fieldMap[firstErrorKey] || firstErrorKey
            errorMessage = `${fieldName}: ${errorValue}`
          }
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail
        } else if (typeof error.response.data === 'object') {
          // Fallback for other error formats
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