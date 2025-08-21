// models/users.ts

/**
 * Comprehensive User Models for Accounting System
 * Handles all user-related data structures, API responses, and form interfaces
 */

// ================================
// AUTHENTICATION INTERFACES
// ================================

/**
 * Response interface for user login
 */
export interface UserLoginResponse {
  message: string
  access: string
  refresh: string
  user: UserProfileInfo
}

/**
 * Token refresh response
 */
export interface TokenRefreshResponse {
  access: string
  refresh?: string
}

/**
 * Basic user profile information
 */
export interface UserProfileInfo {
  user_id: string
  user_name: string
  user_email: string
  role: Role
  division: Division
  profile_picture?: string
}

// ================================
// CORE DATA INTERFACES
// ================================

/**
 * Division/Department interface matching API response
 */
export interface Division {
  div_id: string
  division_name_la: string
  division_name_en: string
  Record_Status: string // Note: API uses 'Record_Status' with capital R
}

/**
 * Role interface matching API response
 */
export interface Role {
  role_id: string
  role_name_la: string
  role_name_en: string
  record_Status: string // Note: API uses 'record_Status' lowercase r
}

// ================================
// USER DATA INTERFACES
// ================================

/**
 * Complete user item as returned by API
 * Matches the actual API response structure
 */
export interface UserItem {
  user_id: string
  user_name: string
  user_email: string
  user_mobile: string
  User_Status: string
  pwd_changed_on: string | null
  division?: Division | string // Can be populated object or just ID
  role?: Role | string // Can be populated object or just ID
  profile_picture?: string // API field name
  InsertDate: string // ISO date string from API
  UpdateDate: string // ISO date string from API
  Maker_Id: string | null
  Maker_DT_Stamp: string | null
  Checker_Id: string | null
  Checker_DT_Stamp: string | null
  Auth_Status: string
  Once_Auth: string | null
}

/**
 * Legacy interface for backward compatibility
 * @deprecated Use UserItem instead
 */
export interface Items extends UserItem {
  id?: number // Legacy field
  profile_image?: File | string | null // Legacy field name
  Record_Status?: string // Legacy field
}

/**
 * User detail response interface
 * Used for individual user queries
 */
export interface UserDetailResponse extends UserItem {
  division: Division // Always populated in detail view
  role: Role // Always populated in detail view
}

/**
 * Legacy detail response interface
 * @deprecated Use UserDetailResponse instead
 */
export interface DetailUsertRespons extends UserDetailResponse {}

// ================================
// API RESPONSE INTERFACES
// ================================

/**
 * User list API response structure
 */
export interface UserListResponse {
  count?: number
  next?: string | null
  previous?: string | null
  results?: UserItem[]
  // Alternative response structures for different endpoints
  Item?: UserItem[]
  items?: UserItem[]
}

/**
 * Legacy list response interface
 * @deprecated Use UserListResponse instead
 */
export interface UserListRespons {
  Item: Items[]
  detail: DetailUsertRespons | null
  role: Role | null
}

// ================================
// FORM AND INPUT INTERFACES
// ================================

/**
 * User form data for creating/updating users
 * Maps frontend form fields to API requirements
 */
export interface UserFormData {
  user_id: string
  user_name: string
  user_email: string
  user_mobile: string
  user_password: string
  div_id: string
  Role_ID: string
  Auth_Status: string
  user_status: boolean
  profile_image: File | string | null // Frontend field name
  Maker_Id?: string
  muth_status?: string
  pwd_changed_on?: string
}

/**
 * User creation request payload
 */
export interface UserCreateRequest {
  user_id: string
  user_name: string
  user_email?: string
  user_mobile: string
  user_password: string
  div_id: string
  Role_ID: string
  Auth_Status: string
  profile_picture?: File // API field name for file upload
}

/**
 * User update request payload
 */
export interface UserUpdateRequest {
  user_id: string
  user_name: string
  user_email?: string
  user_mobile: string
  user_password?: string // Optional for updates
  div_id: string
  Role_ID: string
  Auth_Status: string
  profile_picture?: File // API field name for file upload
}

// ================================
// QUERY AND FILTER INTERFACES
// ================================

/**
 * Query parameters for user list filtering
 */
export interface UserQueryParams {
  div_id?: string | null
  role_id?: string | null
  Auth_Status?: UserStatus
  User_Status?: string
  search?: string
  page?: number
  page_size?: number
  ordering?: string
}

/**
 * Advanced search filters
 */
export interface UserSearchFilters {
  username?: string
  email?: string
  mobile?: string
  division_id?: string
  role_id?: string
  status?: UserStatus
  date_from?: string
  date_to?: string
}

// ================================
// UTILITY TYPES AND ENUMS
// ================================

/**
 * User status enumeration
 */
export enum UserStatus {
  ACTIVE = 'A',
  INACTIVE = 'U', 
  DISABLED = 'I',
  EXPIRED = 'E'
}

/**
 * Status display mapping for UI
 */
export const UserStatusDisplay: Record<UserStatus, string> = {
  [UserStatus.ACTIVE]: 'ເປີດໃຊ້ງານ',
  [UserStatus.INACTIVE]: 'ປິດໃຊ້ງານ',
  [UserStatus.DISABLED]: 'ຖືກປິດ',
  [UserStatus.EXPIRED]: 'ໝົດອາຍຸ'
}

/**
 * Record status enumeration
 */
export enum RecordStatus {
  OPEN = 'O',
  CLOSED = 'C',
  DELETED = 'D'
}

// ================================
// DISPLAY AND UI INTERFACES
// ================================

/**
 * Enhanced user item for display purposes
 */
export interface UserDisplayItem extends UserItem {
  display_name: string
  status_display: string
  division_name: string
  role_name: string
  formatted_insert_date: string
  formatted_update_date: string
  is_active: boolean
  can_edit: boolean
  can_delete: boolean
}

/**
 * User table column configuration
 */
export interface UserTableColumn {
  key: keyof UserDisplayItem
  title: string
  sortable: boolean
  width?: string
  align?: 'start' | 'center' | 'end'
}

// ================================
// VALIDATION INTERFACES
// ================================

/**
 * Validation rule function type
 */
export type ValidationRule = (value: any) => boolean | string

/**
 * User form validation rules
 */
export interface UserValidationRules {
  user_id: ValidationRule[]
  user_name: ValidationRule[]
  user_email: ValidationRule[]
  user_mobile: ValidationRule[]
  user_password: ValidationRule[]
  div_id: ValidationRule[]
  Role_ID: ValidationRule[]
  Auth_Status: ValidationRule[]
}

/**
 * File upload validation constraints
 */
export interface FileUploadConstraints {
  maxSize: number // in bytes
  allowedTypes: string[]
  maxWidth?: number
  maxHeight?: number
}

// ================================
// ERROR AND STATE INTERFACES
// ================================

/**
 * API error response structure
 */
export interface UserApiError {
  message?: string
  user_id?: string[]
  user_name?: string[]
  user_email?: string[]
  user_mobile?: string[]
  div_id?: string[]
  Role_ID?: string[]
  profile_picture?: string[]
  non_field_errors?: string[]
}

/**
 * Store state interface
 */
export interface UserStoreState {
  // Data
  userList: UserItem[]
  currentUser: UserDetailResponse | null
  
  // Forms
  createForm: UserFormData
  updateForm: UserFormData
  
  // State
  loading: boolean
  error: string | null
  
  // Filters
  queryParams: UserQueryParams
  searchFilters: UserSearchFilters
  
  // Pagination
  pagination: {
    page: number
    pageSize: number
    total: number
    hasNext: boolean
    hasPrevious: boolean
  }
}

// ================================
// UTILITY FUNCTIONS TYPES
// ================================

/**
 * User transformation function type
 */
export type UserTransformer<T = UserDisplayItem> = (user: UserItem) => T

/**
 * User filter function type
 */
export type UserFilter = (user: UserItem) => boolean

/**
 * User sort function type
 */
export type UserSort = (a: UserItem, b: UserItem) => number

// ================================
// CONSTANTS AND DEFAULTS
// ================================

/**
 * Default user form data
 */
export const DEFAULT_USER_FORM: UserFormData = {
  user_id: '',
  user_name: '',
  user_email: '',
  user_mobile: '',
  user_password: '',
  div_id: '',
  Role_ID: '',
  Auth_Status: UserStatus.ACTIVE,
  user_status: true,
  profile_image: null,
  Maker_Id: '',
  muth_status: '',
  pwd_changed_on: ''
}

/**
 * Default query parameters
 */
export const DEFAULT_QUERY_PARAMS: UserQueryParams = {
  page: 1,
  page_size: 20,
  ordering: '-UpdateDate'
}

/**
 * File upload constraints for profile pictures
 */
export const PROFILE_UPLOAD_CONSTRAINTS: FileUploadConstraints = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png'],
  maxWidth: 1024,
  maxHeight: 1024
}

/**
 * User table columns configuration
 */
export const USER_TABLE_COLUMNS: UserTableColumn[] = [
  { key: 'user_id', title: 'ລະຫັດຜູ້ໃຊ້', sortable: true, width: '120px' },
  { key: 'user_name', title: 'ຊື່ຜູ້ໃຊ້', sortable: true },
  { key: 'user_email', title: 'ອີເມວ', sortable: true },
  { key: 'division_name', title: 'ພະແນກ', sortable: false },
  { key: 'role_name', title: 'ບົດບາດ', sortable: false },
  { key: 'status_display', title: 'ສະຖານະ', sortable: true, align: 'center' },
  { key: 'formatted_update_date', title: 'ວັນທີແກ້ໄຂ', sortable: true, align: 'center' }
]

// ================================
// BACKWARD COMPATIBILITY
// ================================

/**
 * Legacy User interface for backward compatibility
 * @deprecated Use UserProfileInfo instead
 */
export interface User {
  avatar: string
  fullname: string
  id: number
  username: string
}

// ================================
// TYPE GUARDS
// ================================

/**
 * Type guard to check if a user has populated division
 */
export function hasPopulatedDivision(user: UserItem): user is UserItem & { division: Division } {
  return typeof user.division === 'object' && user.division !== null
}

/**
 * Type guard to check if a user has populated role
 */
export function hasPopulatedRole(user: UserItem): user is UserItem & { role: Role } {
  return typeof user.role === 'object' && user.role !== null
}

/**
 * Type guard to check if profile image is a File
 */
export function isProfileImageFile(image: File | string | null): image is File {
  return image instanceof File
}

// ================================
// HELPER TYPES
// ================================

/**
 * Keys that can be used for user sorting
 */
export type UserSortKey = keyof Pick<UserItem, 'user_name' | 'user_email' | 'InsertDate' | 'UpdateDate' | 'Auth_Status'>

/**
 * Partial user for updates (all fields optional except user_id)
 */
export type UserUpdateData = Partial<UserFormData> & Pick<UserFormData, 'user_id'>

/**
 * User creation data (all required fields)
 */
export type UserCreateData = Omit<UserFormData, 'user_password'> & { user_password: string }

/**
 * User list item (minimal data for list views)
 */
export type UserListItem = Pick<UserItem, 'user_id' | 'user_name' | 'user_email' | 'Auth_Status' | 'UpdateDate'> & {
  division_name?: string
  role_name?: string
}