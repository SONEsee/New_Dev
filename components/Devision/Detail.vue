

<script setup lang="ts">
import { useRoute } from "vue-router";
import { computed, onMounted, ref } from "vue";
import { UseCategoryStore } from "~/stores/category";

const categoryStore = UseCategoryStore();
const route = useRoute();
const id = route.query.id;

const updatedAtFormatted = ref<string>("");
const createdAtFormatted = ref<string>("");

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('lo-LA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

onMounted(async () => {
  try {
    await categoryStore.GetDetailCategory(id?.toString() ?? null);
    if (categoryStore.response_detail_query_data.length > 0) {
      const category = categoryStore.response_detail_query_data[0];
      createdAtFormatted.value = formatDate(category.CreatedAt);
      updatedAtFormatted.value = formatDate(category.UpdatedAt);
    }
  } catch (error) {
    console.error('Error fetching category:', error);
  }
});

const loading = computed(() => categoryStore.loading);
const categoryData = computed(() => categoryStore.response_detail_query_data[0] || null);
</script>

<template>
  
  <section class="bg-gray-50 min-h-screen py-8 px-4">
    <v-container>
      <v-card
        class="mx-auto rounded-lg shadow-lg"
        max-width="800px"
        elevation="3"
      >
        <v-card-title class=" font-weight-bold pa-6 bg-primary text-white">
          <v-icon icon="mdi-view-list"></v-icon>
          ລາຍລະອຽດໝວດໝູ່
        </v-card-title>

        <v-card-text class="pa-6">
          <div v-if="loading" class="d-flex justify-center align-center py-8">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            />
          </div>

          <template v-else-if="categoryData">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="categoryData.Name"
                  label="ຊື່ໝວດໝູ່"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-format-title"
                  class="mb-4"
                />
              </v-col>
              
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="categoryData.ID"
                  label="ລະຫັດ"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-identifier"
                  class="mb-4"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="createdAtFormatted"
                  label="ວັນທີສ້າງ"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-calendar-plus"
                  class="mb-4"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="updatedAtFormatted"
                  label="ວັນທີແກ້ໄຂ"
                  readonly
                  variant="outlined"
                  density="comfortable"
                  prepend-inner-icon="mdi-calendar-edit"
                  class="mb-4"
                />
              </v-col>
            </v-row>
          </template>

          <div v-else class="text-center py-8">
            <v-icon
              size="64"
              color="grey"
              class="mb-4"
            >
              mdi-folder-off-outline
            </v-icon>
            <div class="text-h6 text-grey">
              ບໍ່ພົບຂໍ້ມູນໝວດໝູ່
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </section>
</template>