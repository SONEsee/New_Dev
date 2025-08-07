<script setup lang="ts">
const title = "ບຳລູງຮັກສາຊັບສຶນ";
</script>
<template>
    <div class="pa-4">
        <GlobalTextTitleLine :title="title"/>
        <v-card flat style="border: solid 1px #64b5f6;">
            <v-card-title style="background-color: #64b5f6">
                ຂໍ້ມູນພື້ນຖານ
            </v-card-title>
            <v-col cols="12">
                <v-row>
                    <v-col cols="12" md="3">
                        <GlobalCardTitle :title="'ຊື່ຊັບສິນ'" />
                    </v-col>
                </v-row>
            </v-col>
        </v-card>
    </div>
</template>