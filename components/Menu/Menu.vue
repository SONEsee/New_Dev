<script setup lang="ts">
const title = "ຂໍ້ມູນເມນູຫຼັກ";
import dayjs from '#build/dayjs.imports.mjs';
const menuStore  =useMenuStore();
const res = computed(()=>{
    return menuStore.respone_main_menu_data || [];
})
onMounted(()=>{
    menuStore.GetMainMenu();
})
const header = [
    { title: "ຊື່ເມນູພາສາລາວ", value: "menu_name_la" },
    { title: "ຊື່ເມນູພາສາອັງກິດ", value: "menu_name_en" },
    { title: "ໄອຄອນ", value: "menu_icon" },
    { title: "ສະຖານະການໃຊ້ງານ", value: "is_active" },
    { title: "ວັນທີສ້າງ", value: "created_date" },
    { title: "ຈັດການ", value: "action" },
]
</script>
<template>

    <GlobalTextTitleLine :title="title" />
    
    <v-col cols="12">
<div class="d-flex justify-end mb-2">
        <v-btn color="primary" @click="goPath('/menu/create')">
            <v-icon icon="mdi-plus"></v-icon> ເພີ່ມຂໍ້ມູນເມນູ
        </v-btn>
    
</div>
        <v-data-table  :items="res" :headers="header" class="text-no-wrap elevation-1" flat >
            <template v-slot:item.created_date="{ item }">
                {{ dayjs(item.created_date).format("DD/MM/YYYY") }}
            </template>
            <template v-slot:item.is_active="{ item }">
                <v-chip :color="item.is_active ? 'green' : 'red'">
                    {{ item.is_active ? "ໃຊ້ງານ" : "ບໍ່ໃຊ້ງານ" }}
                </v-chip>
            </template>
            <template v-slot:item.action="{ item }">
                <v-btn small flat class="text-primary" icon="mdi-eye-outline" @click="goPath(`/menu/detail?id=${item.menu_id}`)" />
                <v-btn small flat class="text-info" icon="mdi-pen" @click="goPath(`/menu/edit?id=${item.menu_id}`)" />
                <v-btn small flat class="text-danger" icon="mdi-delete" @click="onDeleteType(item.menu_id)" />
            </template>

        </v-data-table>
    </v-col>
  
</template>