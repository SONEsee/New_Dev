<template>
  <div class="master-text-page">
    <!-- Use the layout -->
    <NuxtLayout name="admin">
      <template #header>
        <div class="header-content">
          <!-- Simple header without complex breadcrumbs -->
          <div class="d-flex align-center justify-space-between">
            <div>
              <h1 class="text-h4 font-weight-light">Master Text Management</h1>
              <p class="text-body-1 text-grey ma-0">ຈັດການ Master Type ແລະ Master Code</p>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="navigateToCreate"
              >
                ເພີ່ມ Master Data
              </v-btn>
              <v-btn
                color="secondary"
                variant="outlined"
                prepend-icon="mdi-lightning-bolt"
                @click="openQuickCreateDialog"
                class="ml-2"
              >
                Quick Create
              </v-btn>
            </div>
          </div>
        </div>
      </template>

      <!-- Main Content -->
      <v-container fluid class="pa-4">
        <!-- Master Text List Component -->
        <MasterTextListComponent
          @master-type-selected="onMasterTypeSelected"
        />
      </v-container>

      <!-- Quick Create Dialog -->
      <v-dialog v-model="quickCreateDialog" max-width="500px" persistent>
        <v-card>
          <v-card-title class="bg-primary text-white">
            <v-icon color="white" class="mr-2">mdi-lightning-bolt</v-icon>
            Quick Create
          </v-card-title>
          <v-card-text class="pa-4">
            <v-form v-model="quickCreateValid">
              <v-text-field
                v-model="quickCreate.masterTypeName"
                label="Master Type Name *"
                :rules="[v => !!v || 'Required']"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-folder-plus"
                placeholder="e.g., AccountType"
                hide-details="auto"
                class="mb-3"
              ></v-text-field>
              
              <v-textarea
                v-model="quickCreate.description"
                label="Description"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-text"
                rows="2"
                placeholder="Brief description of this master type"
                hide-details="auto"
                class="mb-3"
              ></v-textarea>
              
              <v-text-field
                v-model="quickCreate.firstCode"
                label="First Master Code"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-code-tags"
                placeholder="e.g., SAV001"
                hint="Optional: Create the first master code"
                persistent-hint
                hide-details="auto"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              variant="outlined"
              @click="quickCreateDialog = false"
              :disabled="quickCreateLoading"
            >
              Cancel
            </v-btn>
            <v-btn
              color="primary"
              @click="submitQuickCreate"
              :loading="quickCreateLoading"
              :disabled="!quickCreateValid"
            >
              Create
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Success Snackbar -->
      <v-snackbar
        v-model="successSnackbar"
        color="success"
        timeout="3000"
        location="top right"
      >
        <v-icon class="mr-2">mdi-check-circle</v-icon>
        {{ successMessage }}
        <template #actions>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="successSnackbar = false"
          ></v-btn>
        </template>
      </v-snackbar>
    </NuxtLayout>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// Meta
definePageMeta({
  layout: false, // We're using NuxtLayout manually
  middleware: 'auth',
  title: 'Master Text Management'
})

// State
const quickCreateDialog = ref(false)
const quickCreateValid = ref(false)
const quickCreateLoading = ref(false)
const successSnackbar = ref(false)
const successMessage = ref('')

const quickCreate = reactive({
  masterTypeName: '',
  description: '',
  firstCode: ''
})

// Methods
const navigateToCreate = () => {
  navigateTo('/admin/master-text/create')
}

const openQuickCreateDialog = () => {
  Object.assign(quickCreate, {
    masterTypeName: '',
    description: '',
    firstCode: ''
  })
  quickCreateDialog.value = true
}

const submitQuickCreate = async () => {
  try {
    quickCreateLoading.value = true

    // Mock API call - replace with actual implementation
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Show success message
    successMessage.value = `Successfully created Master Type "${quickCreate.masterTypeName}"${quickCreate.firstCode ? ` with first code "${quickCreate.firstCode}"` : ''}`
    successSnackbar.value = true
    quickCreateDialog.value = false

  } catch (error) {
    console.error('Error in quick create:', error)
    
    // Show error message - you can use your preferred method
    alert('Failed to create Master Type')
  } finally {
    quickCreateLoading.value = false
  }
}

const onMasterTypeSelected = (masterType) => {
  // Handle master type selection if needed
  console.log('Master type selected:', masterType)
}

// SEO
useSeoMeta({
  title: 'Master Text Management - Admin Panel',
  description: 'Manage Master Types and Master Codes for the application'
})
</script>

<style scoped>
.master-text-page {
  min-height: 100vh;
  background: #f5f5f5;
}

.header-content {
  width: 100%;
}

:deep(.v-container) {
  max-width: 1400px;
}

@media (max-width: 768px) {
  .header-content .d-flex {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-content .d-flex .d-flex {
    flex-direction: row;
    width: 100%;
    justify-content: flex-start;
    gap: 8px;
  }

  :deep(.v-container) {
    padding: 8px;
  }
}
</style>