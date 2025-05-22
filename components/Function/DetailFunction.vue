<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import dayjs from "#build/dayjs.imports.mjs";
const title = "ລາຍລະອຽດຟັງຊັ່ນ";
const route = useRoute();
const router = useRouter();
const menuStore = useMenuStore();

const id = computed(() => route.query.id as string);

const functionDetail = computed(() => {
  return menuStore.respons_function_menu_detail_data || null;
});

onMounted(() => {
  if (id.value) {
    menuStore.getDetailFunctionMenu(id.value);
  }
});

// ຟັງຊັ່ນລຶບ
const deleteFunction = async () => {
  try {
    const notification = await CallSwal({
      title: "ຄຳເຕືອນ",
      text: "ທ່ານຕ້ອງການລຶບຟັງຊັ້ນນີ້ຫຼືບໍ່?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ຕົກລົງ",
      cancelButtonText: "ຍົກເລີກ",
    });

    if (notification.isConfirmed) {
    }
  } catch (error) {
    console.error("Error deleting function:", error);
  }
};
</script>

<template>
<GlobalTextTitleLine :title="title" />
<v-col cols="12">
    <v-row>
        <v-col cols="12" md="4">
            <GlobalCardTitle :text="functionDetail?.description_la ?? 'N/A'"
            :title="'ຊື່ຟັງຊັ້ນພາສາລາວ / Function Name (Lao)'" />

        </v-col>
        <v-col cols="12" md="4">
            <GlobalCardTitle :text="functionDetail?.description_en ?? 'N/A'"
            :title="'ຊື່ຟັງຊັ້ນພາສາອັງກິດ / Function Name (en)'" />
        </v-col>
        <v-col cols="12" md="4">
            <GlobalCardTitle :text="functionDetail?.function_id ?? 'N/A'"
            :title="'ລະຫັດເມນູ / Function ID'" />
        </v-col>
        <v-col cols="12" md="4">
            <GlobalCardTitle :text="functionDetail?.function_order || null"
            :title="'ລຳດັບ / Function Order'" />  
        </v-col>
        <v-col cols="12" md="4">
            <GlobalCardTitle :text="functionDetail?.is_active ? 'ໃຊ້ງານ' : 'ບໍ່ໃຊ້ງານ'"
            :title="'ສະຖານະ / Status'" />
        </v-col>
        <v-col cols="12" md="4">
            <GlobalCardTitle :text="functionDetail?.created_by ? dayjs(functionDetail.created_by).format('DD/MM/YYYY') : 'N/A'"
            :title="'ສ້າງວັນເດືອນປີ / Created Date'" />
        </v-col>
       
       
    </v-row>
</v-col>
  {{ functionDetail }}
</template>
