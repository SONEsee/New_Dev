<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <!-- Page Header -->
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold text-primary">
              <v-icon left size="28" class="mr-2">mdi-shield-account</v-icon>
              User Access Logs
            </h1>
            <p class="text-subtitle-1 text-grey-600 mt-2">
              Monitor user login and logout activities across the system
            </p>
          </div>
          <div class="d-flex gap-2">
            <v-btn
              @click="exportData"
              variant="outlined"
              color="primary"
              :disabled="loading"
            >
              <v-icon left>mdi-download</v-icon>
              Export
            </v-btn>
            <v-btn
              @click="refreshData"
              :loading="loading"
              color="primary"
              variant="elevated"
            >
              <v-icon left>mdi-refresh</v-icon>
              Refresh
            </v-btn>
          </div>
        </div>

        <!-- Stats Cards -->
        <v-row class="mb-4">
          <v-col cols="12" md="3">
            <v-card class="text-center pa-4" color="success" variant="tonal">
              <v-icon size="32" class="mb-2">mdi-account-check</v-icon>
              <div class="text-h6 font-weight-bold">{{ stats.activeUsers }}</div>
              <div class="text-caption">Active Sessions</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card class="text-center pa-4" color="info" variant="tonal">
              <v-icon size="32" class="mb-2">mdi-login</v-icon>
              <div class="text-h6 font-weight-bold">{{ stats.todayLogins }}</div>
              <div class="text-caption">Today's Logins</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card class="text-center pa-4" color="warning" variant="tonal">
              <v-icon size="32" class="mb-2">mdi-alert</v-icon>
              <div class="text-h6 font-weight-bold">{{ stats.failedLogins }}</div>
              <div class="text-caption">Failed Attempts</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card class="text-center pa-4" color="primary" variant="tonal">
              <v-icon size="32" class="mb-2">mdi-database</v-icon>
              <div class="text-h6 font-weight-bold">{{ totalItems }}</div>
              <div class="text-caption">Total Records</div>
            </v-card>
          </v-col>
        </v-row>

        <!-- Filters Card -->
        <v-card class="mb-4" elevation="2">
          <v-card-title class="d-flex align-center">
            <v-icon left>mdi-filter</v-icon>
            Filters & Search
            <v-spacer />
            <v-chip v-if="hasActiveFilters" color="primary" size="small">
              {{ activeFilterCount }} active
            </v-chip>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="search"
                  label="Search"
                  placeholder="Search by user, IP, or remarks..."
                  prepend-inner-icon="mdi-magnify"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-select
                  v-model="statusFilter"
                  label="Login Status"
                  :items="statusOptions"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-select
                  v-model="logoutTypeFilter"
                  label="Logout Type"
                  :items="logoutTypeOptions"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="dateFrom"
                  label="Date From"
                  type="date"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="2">
                <v-text-field
                  v-model="dateTo"
                  label="Date To"
                  type="date"
                  variant="outlined"
                  density="compact"
                  clearable
                  hide-details
                />
              </v-col>
              <v-col cols="12" md="1" class="d-flex align-center">
                <v-tooltip text="Clear all filters">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      @click="clearFilters"
                      variant="outlined"
                      color="secondary"
                      density="comfortable"
                      :disabled="!hasActiveFilters"
                    >
                      <v-icon>mdi-filter-remove</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Data Table Card -->
        <v-card elevation="3">
          <v-card-title class="d-flex align-center">
            <v-icon left>mdi-table</v-icon>
            Access Logs
            <v-spacer />
            <v-select
              v-model="itemsPerPage"
              :items="[10, 25, 50, 100]"
              label="Rows per page"
              variant="outlined"
              density="compact"
              style="width: 120px"
              hide-details
            />
          </v-card-title>
          
          <v-data-table-server
            v-model:items-per-page="itemsPerPage"
            v-model:page="currentPage"
            :headers="headers"
            :items="accessLogs"
            :items-length="totalItems"
            :loading="loading"
            :search="search"
            item-value="log_id"
            class="elevation-0"
            @update:options="loadData"
          >
            <!-- User column -->
            <template v-slot:item.user="{ item }">
              <div class="d-flex align-center py-2">
                <v-avatar size="36" class="mr-3" color="primary">
                  <v-img 
                    v-if="item.user?.profile_picture" 
                    :src="item.user.profile_picture"
                    :alt="item.user?.user_name || 'User'"
                  />
                  <v-icon v-else color="white">mdi-account</v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-medium text-body-1">
                    {{ item.user?.user_name || 'Unknown User' }}
                  </div>
                  <div class="text-caption text-grey-600">
                    ID: {{ item.user?.user_id || 'N/A' }} • {{ item.user?.user_email || 'No email' }}
                  </div>
                  <div class="text-caption text-grey-500">
                    {{ item.user?.role?.role_name_en || 'No role' }}
                  </div>
                </div>
              </div>
            </template>

            <!-- Login datetime column -->
            <template v-slot:item.login_datetime="{ item }">
              <div class="py-1">
                <div class="font-weight-medium">
                  {{ formatDateTime(item.login_datetime) }}
                </div>
                <div class="text-caption text-grey-600">
                  {{ getTimeAgo(item.login_datetime) }}
                </div>
              </div>
            </template>

            <!-- Logout datetime column -->
            <template v-slot:item.logout_datetime="{ item }">
              <div class="py-1">
                <div v-if="item.logout_datetime">
                  <div class="font-weight-medium">
                    {{ formatDateTime(item.logout_datetime) }}
                  </div>
                  <div class="text-caption text-grey-600">
                    {{ getTimeAgo(item.logout_datetime) }}
                  </div>
                </div>
                <v-chip v-else color="success" size="small" variant="tonal">
                  <v-icon left size="16">mdi-circle</v-icon>
                  Active Session
                </v-chip>
              </div>
            </template>

            <!-- Login status column -->
            <template v-slot:item.login_status="{ item }">
              <v-chip
                :color="getStatusColor(item.login_status)"
                size="small"
                variant="elevated"
              >
                <v-icon left size="16">{{ getStatusIcon(item.login_status) }}</v-icon>
                {{ getStatusText(item.login_status) }}
              </v-chip>
            </template>

            <!-- Logout type column -->
            <template v-slot:item.logout_type="{ item }">
              <v-chip
                v-if="item.logout_type"
                :color="getLogoutTypeColor(item.logout_type)"
                size="small"
                variant="tonal"
              >
                <v-icon left size="16">{{ getLogoutTypeIcon(item.logout_type) }}</v-icon>
                {{ getLogoutTypeText(item.logout_type) }}
              </v-chip>
              <span v-else class="text-grey-500">—</span>
            </template>

            <!-- IP address column -->
            <template v-slot:item.ip_address="{ item }">
              <div class="d-flex align-center">
                <v-icon left size="16" class="mr-1" color="grey">mdi-ip-network</v-icon>
                <span class="font-mono text-body-2">{{ item.ip_address || 'N/A' }}</span>
                <v-tooltip v-if="item.user_agent" text="View User Agent">
                  <template v-slot:activator="{ props }">
                    <v-icon 
                      v-bind="props" 
                      size="14" 
                      class="ml-1" 
                      color="grey-darken-1"
                      @click="showUserAgent(item.user_agent)"
                    >
                      mdi-information-outline
                    </v-icon>
                  </template>
                </v-tooltip>
              </div>
            </template>

            <!-- Session duration column -->
            <template v-slot:item.session_duration="{ item }">
              <v-chip
                :color="getDurationColor(item)"
                size="small"
                variant="tonal"
              >
                <v-icon left size="16">mdi-timer</v-icon>
                {{ getSessionDuration(item) }}
              </v-chip>
            </template>

            <!-- Actions column -->
            <template v-slot:item.actions="{ item }">
              <div class="d-flex gap-1">
                <v-tooltip text="View Details">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      @click="viewDetails(item)"
                      icon
                      variant="text"
                      size="small"
                      color="primary"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
                <v-tooltip v-if="!item.logout_datetime" text="Force Logout">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      @click="confirmForceLogout(item)"
                      icon
                      variant="text"
                      size="small"
                      color="error"
                    >
                      <v-icon>mdi-logout</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </div>
            </template>

            <!-- Loading state -->
            <template v-slot:loading>
              <v-skeleton-loader type="table-row@10" />
            </template>

            <!-- No data state -->
            <template v-slot:no-data>
              <div class="text-center pa-8">
                <v-icon size="64" color="grey-400" class="mb-4">
                  mdi-database-search
                </v-icon>
                <h3 class="text-h6 text-grey-600 mb-2">No Access Logs Found</h3>
                <p class="text-body-2 text-grey-500 mb-4">
                  No user access logs match your current search criteria.
                </p>
                <v-btn @click="clearFilters" variant="outlined" color="primary">
                  Clear Filters
                </v-btn>
              </div>
            </template>
          </v-data-table-server>
        </v-card>
      </v-col>
    </v-row>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="900">
      <v-card v-if="selectedLog">
        <v-card-title class="d-flex align-center bg-primary">
          <v-icon left color="white">mdi-information</v-icon>
          <span class="text-white">Access Log Details</span>
          <v-spacer />
          <v-btn icon @click="detailsDialog = false" color="white">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <!-- User Information Section -->
          <v-row class="mb-4">
            <v-col cols="12">
              <h3 class="text-h6 mb-3 d-flex align-center">
                <v-icon left color="primary">mdi-account</v-icon>
                User Information
              </h3>
              <v-card variant="outlined">
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="6">
                      <div class="d-flex align-center mb-3">
                        <v-avatar size="48" class="mr-3" color="primary">
                          <v-img 
                            v-if="selectedLog.user?.profile_picture" 
                            :src="selectedLog.user.profile_picture"
                            :alt="selectedLog.user?.user_name || 'User'"
                          />
                          <v-icon v-else color="white">mdi-account</v-icon>
                        </v-avatar>
                        <div>
                          <div class="text-h6 font-weight-bold">
                            {{ selectedLog.user?.user_name || 'N/A' }}
                          </div>
                          <div class="text-body-2 text-grey-600">
                            {{ selectedLog.user?.user_email || 'No email' }}
                          </div>
                        </div>
                      </div>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-list density="compact">
                        <v-list-item>
                          <v-list-item-title>User ID</v-list-item-title>
                          <v-list-item-subtitle>{{ selectedLog.user?.user_id || 'N/A' }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>Role</v-list-item-title>
                          <v-list-item-subtitle>{{ selectedLog.user?.role?.role_name_en || 'N/A' }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>Division</v-list-item-title>
                          <v-list-item-subtitle>{{ selectedLog.user?.division?.division_name_en || 'N/A' }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Session Information Section -->
          <v-row class="mb-4">
            <v-col cols="12">
              <h3 class="text-h6 mb-3 d-flex align-center">
                <v-icon left color="primary">mdi-clock</v-icon>
                Session Information
              </h3>
              <v-card variant="outlined">
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="6">
                      <v-list density="compact">
                        <v-list-item>
                          <v-list-item-title>Log ID</v-list-item-title>
                          <v-list-item-subtitle class="font-mono">{{ selectedLog.log_id }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>Session ID</v-list-item-title>
                          <v-list-item-subtitle class="font-mono text-wrap">{{ selectedLog.session_id || 'N/A' }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>Login Time</v-list-item-title>
                          <v-list-item-subtitle>{{ formatDateTime(selectedLog.login_datetime) }}</v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>Logout Time</v-list-item-title>
                          <v-list-item-subtitle>
                            <span v-if="selectedLog.logout_datetime">
                              {{ formatDateTime(selectedLog.logout_datetime) }}
                            </span>
                            <v-chip v-else color="success" size="small">Still Active</v-chip>
                          </v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-col>
                    <v-col cols="12" md="6">
                      <v-list density="compact">
                        <v-list-item>
                          <v-list-item-title>Session Duration</v-list-item-title>
                          <v-list-item-subtitle>
                            <v-chip :color="getDurationColor(selectedLog)" size="small">
                              {{ getSessionDuration(selectedLog) }}
                            </v-chip>
                          </v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>Login Status</v-list-item-title>
                          <v-list-item-subtitle>
                            <v-chip :color="getStatusColor(selectedLog.login_status)" size="small">
                              <v-icon left size="16">{{ getStatusIcon(selectedLog.login_status) }}</v-icon>
                              {{ getStatusText(selectedLog.login_status) }}
                            </v-chip>
                          </v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>Logout Type</v-list-item-title>
                          <v-list-item-subtitle>
                            <v-chip 
                              v-if="selectedLog.logout_type" 
                              :color="getLogoutTypeColor(selectedLog.logout_type)" 
                              size="small"
                            >
                              <v-icon left size="16">{{ getLogoutTypeIcon(selectedLog.logout_type) }}</v-icon>
                              {{ getLogoutTypeText(selectedLog.logout_type) }}
                            </v-chip>
                            <span v-else class="text-grey-500">N/A</span>
                          </v-list-item-subtitle>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-title>IP Address</v-list-item-title>
                          <v-list-item-subtitle class="font-mono">{{ selectedLog.ip_address || 'N/A' }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Technical Details Section -->
          <v-row v-if="selectedLog.user_agent || selectedLog.remarks">
            <v-col cols="12">
              <h3 class="text-h6 mb-3 d-flex align-center">
                <v-icon left color="primary">mdi-cog</v-icon>
                Technical Details
              </h3>
              <v-card variant="outlined">
                <v-card-text>
                  <v-list density="compact" v-if="selectedLog.user_agent">
                    <v-list-item>
                      <v-list-item-title>User Agent</v-list-item-title>
                      <v-list-item-subtitle class="font-mono text-wrap mt-1">
                        {{ selectedLog.user_agent }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                  <v-list density="compact" v-if="selectedLog.remarks" class="mt-3">
                    <v-list-item>
                      <v-list-item-title>Remarks</v-list-item-title>
                      <v-list-item-subtitle class="mt-1">{{ selectedLog.remarks }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="px-6 pb-4">
          <v-spacer />
          <v-btn @click="detailsDialog = false" color="grey" variant="outlined">
            Close
          </v-btn>
          <v-btn 
            v-if="!selectedLog.logout_datetime" 
            @click="confirmForceLogout(selectedLog)" 
            color="error"
            variant="elevated"
          >
            <v-icon left>mdi-logout</v-icon>
            Force Logout
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- User Agent Dialog -->
    <v-dialog v-model="userAgentDialog" max-width="600">
      <v-card>
        <v-card-title>
          <v-icon left>mdi-web</v-icon>
          User Agent Information
        </v-card-title>
        <v-card-text>
          <v-textarea
            v-model="selectedUserAgent"
            readonly
            variant="outlined"
            auto-grow
            class="font-mono"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="userAgentDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Force Logout Confirmation Dialog -->
    <v-dialog v-model="forceLogoutDialog" max-width="500">
      <v-card>
        <v-card-title class="text-error">
          <v-icon left>mdi-alert</v-icon>
          Confirm Force Logout
        </v-card-title>
        <v-card-text>
          <p>Are you sure you want to force logout this user?</p>
          <div v-if="logoutCandidate" class="mt-3 pa-3 bg-grey-lighten-5 rounded">
            <strong>User:</strong> {{ logoutCandidate.user?.user_name || 'N/A' }}<br>
            <strong>Session:</strong> {{ logoutCandidate.session_id }}<br>
            <strong>Login Time:</strong> {{ formatDateTime(logoutCandidate.login_datetime) }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="forceLogoutDialog = false" variant="outlined">Cancel</v-btn>
          <v-btn @click="executeForceLogout" color="error" :loading="forceLogoutLoading">
            Force Logout
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="successSnackbar"
      color="success"
      :timeout="3000"
      location="top"
    >
      {{ successMessage }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="successSnackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar
      v-model="errorSnackbar"
      color="error"
      :timeout="5000"
      location="top"
    >
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="errorSnackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import axios from '@/helpers/axios'
import { LOG } from '@zxing/library/esm/core/datamatrix/encoder/constants'

// Page metadata
definePageMeta({
  title: 'User Access Logs',
  requiresAuth: true
})

// Reactive data
const loading = ref(false)
const accessLogs = ref([])
const totalItems = ref(0)
const currentPage = ref(1)
const itemsPerPage = ref(25)
const search = ref('')
const statusFilter = ref(null)
const logoutTypeFilter = ref(null)
const dateFrom = ref('')
const dateTo = ref('')

// Dialog states
const detailsDialog = ref(false)
const userAgentDialog = ref(false)
const forceLogoutDialog = ref(false)
const selectedLog = ref(null)
const selectedUserAgent = ref('')
const logoutCandidate = ref(null)
const forceLogoutLoading = ref(false)

// Notification states
const errorSnackbar = ref(false)
const errorMessage = ref('')
const successSnackbar = ref(false)
const successMessage = ref('')

// Stats
const stats = ref({
  activeUsers: 0,
  todayLogins: 0,
  failedLogins: 0
})

// Filter options
const statusOptions = [
  { title: 'Success', value: 'S' },
  { title: 'Failed', value: 'F' },
  { title: 'Admin Action', value: 'A' }
]

const logoutTypeOptions = [
  { title: 'User Initiated', value: 'U' },
  { title: 'Force Logout', value: 'F' },
  { title: 'Timeout', value: 'T' },
  { title: 'System', value: 'S' }
]

// Table headers
const headers = ref([
  { title: 'User', key: 'user', sortable: false, width: '250px' },
  { title: 'Login Time', key: 'login_datetime', sortable: true, width: '180px' },
  { title: 'Logout Time', key: 'logout_datetime', sortable: true, width: '180px' },
  { title: 'Status', key: 'login_status', sortable: true, width: '120px' },
  { title: 'Logout Type', key: 'logout_type', sortable: false, width: '130px' },
  { title: 'IP Address', key: 'ip_address', sortable: false, width: '150px' },
  { title: 'Duration', key: 'session_duration', sortable: false, width: '120px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '100px' }
])

// Computed properties
const hasActiveFilters = computed(() => {
  return !!(search.value || statusFilter.value || logoutTypeFilter.value || dateFrom.value || dateTo.value)
})

const activeFilterCount = computed(() => {
  let count = 0
  if (search.value) count++
  if (statusFilter.value) count++
  if (logoutTypeFilter.value) count++
  if (dateFrom.value) count++
  if (dateTo.value) count++
  return count
})

// Methods
const loadData = async (options = {}) => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page);
    if (options.itemsPerPage) params.append('page_size', options.itemsPerPage);
    if (search.value?.trim()) params.append('search', search.value.trim());
    if (statusFilter.value) params.append('login_status', statusFilter.value);
    if (logoutTypeFilter.value) params.append('logout_type', logoutTypeFilter.value);
    if (dateFrom.value) params.append('login_datetime__date__gte', dateFrom.value);
    if (dateTo.value) params.append('login_datetime__date__lte', dateTo.value);
    if (options.sortBy && options.sortBy.length > 0) {
      const sort = options.sortBy[0];
      const sortKey = sort.order === 'desc' ? `-${sort.key}` : sort.key;
      params.append('ordering', sortKey);
    }

    console.log('Query Params:', params.toString());

    const response = await axios.get(`/api/user-access-logs/?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('API Response:', response.data);

    if (response.data) {
      if (Array.isArray(response.data)) {
        accessLogs.value = response.data;
        totalItems.value = response.data.length;
      } else if (response.data.results && typeof response.data.count === 'number') {
        accessLogs.value = response.data.results;
        totalItems.value = response.data.count;
      } else {
        console.error('Unexpected API response structure:', response.data);
        accessLogs.value = [];
        totalItems.value = 0;
        showError('Unexpected API response structure.');
      }
      calculateStats();
    } else {
      accessLogs.value = [];
      totalItems.value = 0;
      showError('No data returned from API.');
    }
  } catch (error) {
    console.error('Failed to load access logs:', error);
    showError('Failed to load user access logs. Please try again.');
    accessLogs.value = [];
    totalItems.value = 0;
  } finally {
    loading.value = false;
  }
};
const calculateStats = () => {
  console.log('Calculating stats for:', accessLogs.value);
  const today = new Date().toDateString();
  stats.value.activeUsers = accessLogs.value.filter(log => !log.logout_datetime).length;
  stats.value.todayLogins = accessLogs.value.filter(log => {
    return new Date(log.login_datetime).toDateString() === today;
  }).length;
  stats.value.failedLogins = accessLogs.value.filter(log => log.login_status === 'F').length;
};

const refreshData = () => {
  loadData({ 
    page: currentPage.value, 
    itemsPerPage: itemsPerPage.value 
  })
}

const clearFilters = () => {
  search.value = ''
  statusFilter.value = null
  logoutTypeFilter.value = null
  dateFrom.value = ''
  dateTo.value = ''
  currentPage.value = 1
  refreshData()
}

const viewDetails = (log) => {
  selectedLog.value = log
  detailsDialog.value = true
}

const showUserAgent = (userAgent) => {
  selectedUserAgent.value = userAgent
  userAgentDialog.value = true
}

const confirmForceLogout = (log) => {
  logoutCandidate.value = log
  forceLogoutDialog.value = true
}
const executeForceLogout = async () => {
  if (!logoutCandidate.value) return
  
  forceLogoutLoading.value = true
  try {
    // Call the force logout endpoint
    const response = await axios.post(
      `/api/force-logout/${logoutCandidate.value.user?.user_id}/`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      }
    )
    
    showSuccess(response.data.message || 'User has been successfully logged out.')
    forceLogoutDialog.value = false
    detailsDialog.value = false
    refreshData()
    
  } catch (error) {
    console.error('Failed to force logout:', error)
    const errorMsg = error.response?.data?.error || 'Failed to force logout user.'
    showError(errorMsg)
  } finally {
    forceLogoutLoading.value = false
  }
}

const exportData = async () => {
  try {
    const params = new URLSearchParams()
    if (search.value?.trim()) params.append('search', search.value.trim())
    if (statusFilter.value) params.append('login_status', statusFilter.value)
    if (logoutTypeFilter.value) params.append('logout_type', logoutTypeFilter.value)
    if (dateFrom.value) params.append('login_datetime__date__gte', dateFrom.value)
    if (dateTo.value) params.append('login_datetime__date__lte', dateTo.value)
    params.append('export', 'csv')
    
    const response = await axios.get(`/api/user-access-logs/?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      responseType: 'blob'
    })

    console.log(response.data);
    
    
    const blob = new Blob([response.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `user-access-logs-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    showSuccess('Data exported successfully.')
    
  } catch (error) {
    console.error('Failed to export data:', error)
    showError('Failed to export data. Please try again.')
  }
}

const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token')
}

const showError = (message) => {
  errorMessage.value = message
  errorSnackbar.value = true
}

const showSuccess = (message) => {
  successMessage.value = message
  successSnackbar.value = true
}

// Utility functions
const formatDateTime = (dateTime) => {
  if (!dateTime) return 'N/A'
  return new Date(dateTime).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

const getTimeAgo = (dateTime) => {
  if (!dateTime) return ''
  const now = new Date()
  const date = new Date(dateTime)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMins > 0) return `${diffMins}m ago`
  return 'Just now'
}

const getStatusColor = (status) => {
  const colors = {
    'S': 'success',
    'F': 'error',
    'A': 'warning'
  }
  return colors[status] || 'grey'
}

const getStatusText = (status) => {
  const texts = {
    'S': 'Success',
    'F': 'Failed',
    'A': 'Admin Action'
  }
  return texts[status] || 'Unknown'
}

const getStatusIcon = (status) => {
  const icons = {
    'S': 'mdi-check-circle',
    'F': 'mdi-alert-circle',
    'A': 'mdi-shield-alert'
  }
  return icons[status] || 'mdi-help-circle'
}

const getLogoutTypeColor = (type) => {
  const colors = {
    'U': 'primary',
    'F': 'error',
    'T': 'warning',
    'S': 'info'
  }
  return colors[type] || 'grey'
}

const getLogoutTypeText = (type) => {
  const texts = {
    'U': 'User Initiated',
    'F': 'Force Logout',
    'T': 'Timeout',
    'S': 'System'
  }
  return texts[type] || 'Unknown'
}

const getLogoutTypeIcon = (type) => {
  const icons = {
    'U': 'mdi-logout',
    'F': 'mdi-account-cancel',
    'T': 'mdi-clock-alert',
    'S': 'mdi-cog'
  }
  return icons[type] || 'mdi-help-circle'
}

const getSessionDuration = (log) => {
  if (!log.login_datetime) return 'N/A'
  
  const loginTime = new Date(log.login_datetime)
  const logoutTime = log.logout_datetime ? new Date(log.logout_datetime) : new Date()
  const durationMs = logoutTime - loginTime
  
  const hours = Math.floor(durationMs / (1000 * 60 * 60))
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    const remainingHours = hours % 24
    return `${days}d ${remainingHours}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

const getDurationColor = (log) => {
  if (!log.logout_datetime) return 'success' // Active session
  
  const durationMs = new Date(log.logout_datetime) - new Date(log.login_datetime)
  const hours = durationMs / (1000 * 60 * 60)
  
  if (hours > 8) return 'success'    // Long productive session
  if (hours > 2) return 'primary'    // Normal session  
  if (hours > 0.5) return 'warning'  // Short session
  return 'error'                     // Very short session
}

// Watchers for reactive filtering
watch([search, statusFilter, logoutTypeFilter, dateFrom, dateTo], () => {
  currentPage.value = 1
  refreshData()
}, { debounce: 500 })

// Watch itemsPerPage changes
watch(itemsPerPage, () => {
  currentPage.value = 1
  refreshData()
})

// Initialize data on mount
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.font-mono {
  font-family: 'Courier New', 'Consolas', 'Monaco', monospace;
}

.text-wrap {
  word-break: break-word;
  white-space: pre-wrap;
}

:deep(.v-data-table-server .v-data-table__td) {
  padding: 8px 12px;
  vertical-align: middle;
}

:deep(.v-data-table-server .v-data-table__th) {
  font-weight: 600;
}

.v-card {
  border-radius: 12px;
}

.v-chip {
  font-weight: 500;
}

.gap-2 {
  gap: 8px;
}

.gap-1 {
  gap: 4px;
}

:deep(.v-skeleton-loader__table-row) {
  height: 60px;
}
</style>