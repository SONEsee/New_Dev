<script setup lang="ts"></script>
<template>
  <v-container>
    <v-col cols="12">
      <v-row>
        <v-col cols="12" md="6">
          <div style="border: 1px solid #839192; height: 60vh" class="rounded">
            <LoanDashboard />
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div style="border: 1px solid #839192; height: 60vh" class="rounded">
            <ColDashboard />
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div style="border: 1px solid #839192; height: 60vh" class="rounded">
            <IncomeDashbord />
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div
            style="border: 1px solid #839192; height: 60vh"
            class="rounded d-flex justify-center align-center"
          >
            <p>ກຳລັງພັດທະນາ....</p>
          </div>
        </v-col>
      </v-row>
    </v-col></v-container
  >
</template>
