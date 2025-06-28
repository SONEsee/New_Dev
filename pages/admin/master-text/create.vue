<template>
  <div class="create-page">
    <!-- Use the layout -->
    <NuxtLayout name="admin">
      <template #header>
        <div class="header-content">
          <!-- Breadcrumbs -->
          <BreadcrumbComponent 
            :items="[
              { title: 'Master Text', to: '/admin/master-text', icon: 'mdi-format-list-text' }
            ]"
            current="Create Master Data"
          />
          
          <!-- Header Title and Actions -->
          <div class="d-flex align-center justify-space-between mt-3">
            <div>
              <h1 class="text-h4 font-weight-light">Create Master Data</h1>
              <p class="text-body-1 text-grey ma-0">ສ້າງ Master Type ແລະ Master Code ໃໝ່</p>
            </div>
            <div class="d-flex gap-2">
              <v-btn
                variant="outlined"
                @click="$router.back()"
                prepend-icon="mdi-arrow-left"
                size="small"
              >
                ກັບຄືນ
              </v-btn>
              <v-btn
                color="info"
                variant="text"
                @click="$router.push('/admin/master-text')"
                prepend-icon="mdi-view-list"
                size="small"
              >
                ລາຍການທັງໝົດ
              </v-btn>
            </div>
          </div>
        </div>
      </template>

      <!-- Main Content -->
      <v-container fluid class="pa-4">
        <MasterDataCreateComponent />
      </v-container>
    </NuxtLayout>
  </div>
</template>

<script setup>
// Meta
definePageMeta({
  layout: false, // We're using NuxtLayout manually
  middleware: 'auth',
  title: 'Create Master Data'
})

// SEO
useSeoMeta({
  title: 'Create Master Data - Admin Panel',
  description: 'Create new Master Types and Master Codes for the application'
})
</script>

<style scoped>
.create-page {
  min-height: 100vh;
  background: #f5f5f5;
}

:deep(.v-container) {
  max-width: 1400px;
}

.header-content {
  width: 100%;
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
    justify-content: space-between;
  }
}
</style>