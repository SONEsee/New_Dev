<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

interface SalePeriod {
  sale_date: Date | string;
  id: string;
}

const title = "ຂໍ້ມູນລາຍງານການຂາຍ";
const saleStore = useReportSaleStore();
const salesDate = UseSaleStore();

const selectedDate = ref<SalePeriod | null>(null);
const loading = ref(false);
const dayjs = useDayjs();

onMounted(async () => {
  loading.value = true;
  try {
    await salesDate.GetSalePeriodListData(null)

    if (date.value && date.value.length > 0) {
      selectedDate.value = {
        ...date.value[0],
        sale_date: new Date(date.value[0].sale_date),
      };

      if (selectedDate.value) {
        saleStore.request_sale_report.sale_date = selectedDate.value.sale_date;
        await saleStore.GetReportSaleData();
      }
    }
  } catch (error) {
    console.error("Error initializing data:", error);
  } finally {
    loading.value = false;
  }
});

const date = computed(() => {
  return salesDate.sale_periods;
});

const item = computed(() => {
  return saleStore.response_data_report;
});

const headers = [
  { title: "Agency Code", value: "agency_code" },
  { title: "POS Code", value: "pos_code" },
  { title: "Sales Amount", value: "total_sale_amount" },
  { title: "Date", value: "sale_date" },
  { title: "Full Name", value: "agency_name" },
];

const searchData = async () => {
  loading.value = true;
  try {
    saleStore.request_sale_report.sale_date =
      selectedDate.value?.sale_date || null;
    await saleStore.GetReportSaleData();
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    loading.value = false;
  }
};

const formatDisplayDate = (dateValue: SalePeriod | null): string => {
  if (dateValue && dateValue.sale_date) {
    return dayjs(dateValue.sale_date).format("YYYY-MM-DD");
  }
  return "";
};

const exportToExcel = () => {
  loading.value = true;
  try {
    let csvContent = "";

    const headerRow = headers.map((header) => `"${header.title}"`).join(",");
    csvContent += headerRow + "\n";

    item.value.forEach((row) => {
      const dataRow = headers
        .map((header) => {
          let value = row[header.value];

          if (header.value === "sale_date" && value) {
            value = dayjs(value).format("YYYY-MM-DD");
          }

          if (header.value === "total_sale_amount" && value) {
            try {
              value = formatnumber(value);
            } catch (e) {}
          }

          return typeof value === "string" && value.includes(",")
            ? `"${value}"`
            : `"${value}"`;
        })
        .join(",");
      csvContent += dataRow + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);

    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const filename = selectedDate.value
      ? `report_${formatDisplayDate(selectedDate.value)}.xlsx`
      : `report_all_data_${formattedDate}.xlsx`;

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log("Excel file exported successfully");
  } catch (error) {
    console.error("Error exporting to Excel:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <v-card>
    <div class="pa-3">
      <div>
        <v-col cols="12">
          <GlobalTextTitleLine :title="title" />
        </v-col>
      </div>
      <div>
        <v-row>
          <v-col cols="3">
            <v-autocomplete
              v-model="selectedDate"
              density="compact"
              label="ເລືອກວັນທີ"
              :items="date"
              item-value="@self"
              :item-title="(item) => formatDisplayDate(item)"
              variant="outlined"
              clearable
              placeholder="ເລືອກວັນທີເພື່ອກັ່ນຕອງຂໍ້ມູນ"
              :loading="loading"
              return-object
            ></v-autocomplete>
          </v-col>
          <v-col cols="3">
            <v-btn
              color="primary"
              flat
              prepend-icon="mdi-magnify"
              :loading="loading"
              @click="searchData"
            >
              <p>ຄົ້ນຫາ</p>
            </v-btn>
          </v-col>
          <v-col cols="6">
            <div class="d-flex justify-end">
              <v-btn
                color="success"
                flat
                prepend-icon="mdi-microsoft-excel"
                :loading="loading"
                :disabled="!item || item.length === 0"
                @click="exportToExcel"
              >
                <p style="color: white">ສ້າງໄຟລ Excel</p>
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </div>

      <div style="height: ">
        <div class="d-flex justify-center">
          <v-data-table
            :items="item"
            :headers="headers"
            density="compact"
            class="text-no-wrap"
            hover
            :loading="loading"
          >
            <template v-slot:item.sale_date="{ item }">
              {{ dayjs(item.sale_date).format("YYYY-MM-DD") }}
            </template>
            <template v-slot:item.total_sale_amount="{ item }">
              {{ formatnumber(item.total_sale_amount) }}
            </template>
          </v-data-table>
        </div>
      </div>
    </div>
  </v-card>
</template>