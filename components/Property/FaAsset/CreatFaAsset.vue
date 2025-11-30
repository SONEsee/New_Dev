<script lang="ts" setup>
import { CallSwal } from "#build/imports";
import { useRouter, useRoute } from "vue-router";
import { nextTick } from "vue";
const isGeneratingCode = ref(false);
const currencyStore = useCerrencyStore();
const eodStore = useDateStore();
const eodData = computed(() => {
  const data = eodStore.response_data_eod;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const currency = computed(() => {
  const data = currencyStore.respons_cerrency_data;

  if (Array.isArray(data)) {
    return data;
  } else if (data && typeof data === "object") {
    return [data];
  }
  return [];
});

const noaccStore = useMasterStore();
const noacc = computed(() => {
  return noaccStore.respone_data_master?.MasterCodes || [];
});

const subgl = computed(() => {
  const response = noaccStore.respone_data_sub;

  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }

  if (response.items && Array.isArray(response.items)) {
    return response.items;
  }

  return [];
});

const assetStoreInstance = assetStore();
const mockData = computed(() => {
  return assetStoreInstance.response_asset_list || [];
});

const assetcode = computed(() => {
  return faAssetStoreInstance.response_fa_asset_list || [];
});

const locationStoreInstance = locationStore();
const location = computed(() => {
  return locationStoreInstance.response_location_list || [];
});

const supplierStoreInstance = supplierStore();
const supplier = computed(() => {
  return supplierStoreInstance.response_supplier_list || [];
});

const faAssetStoreInstance = faAssetStore();
const router = useRouter();
const route = useRoute();

const title = ref("ເພີ່ມຊັບສົມບັດຄົງທີ່ໃໝ່");
const loading = ref(false);
const form = ref();

const urlAssetCode = computed(() => {
  const param = route.query.asset_type_id as string;
  return param ? parseInt(param) : null;
});

const currencyOptions = [
  { title: "ກີບລາວ (LAK)", value: "LAK" },
  { title: "ດໍລ່າສະຫະລັດ (USD)", value: "USD" },
  { title: "ບາດໄທ (THB)", value: "THB" },
];

const doca_type = [
  { title: "ເສັ້ນຊື່", value: "SL" },
  { title: "ຍອດລົດລົງ", value: "DL" },
  { title: "ຕາມໜວຍພະລິດ", value: "PU" },
];

const isAutoCalculating = ref(false);

const formatNumber = (value: any) => {
  if (!value && value !== 0) return "";
  const num = parseFloat(value);
  if (isNaN(num)) return "";

  if (num % 1 === 0) {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  } else {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }
};

const parseFormattedNumber = (value: any) => {
  if (!value) return null;
  const cleanValue = value.toString().replace(/,/g, "");
  const num = parseFloat(cleanValue);
  return isNaN(num) ? null : num;
};

const formattedAssetValue = computed({
  get: () =>
    formatNumber(faAssetStoreInstance.form_create_fa_asset.asset_value),
  set: (val) => {
    faAssetStoreInstance.form_create_fa_asset.asset_value =
      parseFormattedNumber(val);
  },
});

const formattedSalvageValue = computed({
  get: () =>
    formatNumber(faAssetStoreInstance.form_create_fa_asset.asset_salvage_value),
  set: (val) => {
    faAssetStoreInstance.form_create_fa_asset.asset_salvage_value =
      parseFormattedNumber(val);
  },
});

const formattedAccuDpcaValue = computed({
  get: () =>
    formatNumber(
      faAssetStoreInstance.form_create_fa_asset.asset_accu_dpca_value
    ),
  set: (val) => {
    faAssetStoreInstance.form_create_fa_asset.asset_accu_dpca_value =
      parseFormattedNumber(val);
  },
});

const formattedAssetValueRemain = computed(() => {
  return formatNumber(
    faAssetStoreInstance.form_create_fa_asset.asset_value_remain
  );
});

const formattedAssetValueRemainBegin = computed(() => {
  return formatNumber(
    faAssetStoreInstance.form_create_fa_asset.asset_value_remainBegin
  );
});
const formattedAssetValueRemainMonth = computed(() => {
  const assetValue = faAssetStoreInstance.form_create_fa_asset.asset_value;
  const salvageValue =
    faAssetStoreInstance.form_create_fa_asset.asset_salvage_value;
  const usefulLife =
    faAssetStoreInstance.form_create_fa_asset.asset_useful_life;

  if (assetValue && usefulLife && usefulLife > 0) {
    // ຄຳນວນ: (ມູນຄ່າເລີ່ມຕົ້ນ - ມູນຄ່າຊາກ) ÷ (ອາຍຸການໃຊ້ງານ × 12)
    const depreciableAmount = assetValue - (salvageValue || 0);
    const monthlyValue = depreciableAmount / (usefulLife * 12);
    const roundedValue = Math.round(monthlyValue * 100) / 100;

    faAssetStoreInstance.form_create_fa_asset.asset_value_remainMonth =
      roundedValue;
    return formatNumber(roundedValue);
  }

  faAssetStoreInstance.form_create_fa_asset.asset_value_remainMonth = 0;
  return formatNumber(0);
});
// const formattedAssetValueRemainMonth = computed(() => {
//   const assetValue = faAssetStoreInstance.form_create_fa_asset.asset_value;
//   const usefulLife =
//     faAssetStoreInstance.form_create_fa_asset.asset_useful_life;

//   if (assetValue && usefulLife && usefulLife > 0) {
//     const monthlyValue = assetValue / (usefulLife * 12);
//     const roundedValue = Math.round(monthlyValue * 100) / 100;
//     faAssetStoreInstance.form_create_fa_asset.asset_value_remainMonth =
//       roundedValue;
//     return formatNumber(roundedValue);
//   }

//   faAssetStoreInstance.form_create_fa_asset.asset_value_remainMonth = 0;
//   return formatNumber(0);
// });

const formattedAssetValueRemainLast = computed(() => {
  return formatNumber(
    faAssetStoreInstance.form_create_fa_asset.asset_value_remainLast
  );
});

// const generateReferenceNo = () => {
//   const assetListCode =
//     faAssetStoreInstance.form_create_fa_asset.asset_list_code;

//   if (!assetListCode) {
//     return "";
//   }

//   const now = new Date();
//   const day = now.getDate().toString().padStart(2, "0");
//   const month = (now.getMonth() + 1).toString().padStart(2, "0");
//   const year = now.getFullYear();
//   const dateString = `${year}${month}${day}`;

//   return `AS-UNC-${dateString}-${assetListCode}`;
// };
const generateReferenceNo = () => {
  const assetListCode = faAssetStoreInstance.form_create_fa_asset.asset_list_code;
  
  if (!assetListCode) {
    return "";
  }

  const { dateString } = getEodDates();
  return `AS-UNC-${dateString}-${assetListCode}`;
};
// const computedReferenceNo = computed(() => {
//   return generateReferenceNo();
// });
const computedReferenceNo = computed(() => {
  return generateReferenceNo();
});
const goBack = () => {
  router.go(-1);
};
const getEodDates = () => {
  const eod = eodData.value?.[0];
  
  if (!eod || !eod.start_date) {
    // ຖ້າບໍ່ມີຂໍ້ມູນ EOD ໃຫ້ໃຊ້ວັນທີ່ປະຈຸບັນ
    const currentDate = new Date();
    return {
      startDate: currentDate,
      year: currentDate.getFullYear().toString(),
      yearMonth: `${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, "0")}`,
      dateString: `${currentDate.getFullYear()}${(currentDate.getMonth() + 1).toString().padStart(2, "0")}${currentDate.getDate().toString().padStart(2, "0")}`
    };
  }

  const startDate = new Date(eod.start_date);
  const year = startDate.getFullYear().toString();
  const month = (startDate.getMonth() + 1).toString().padStart(2, "0");
  const day = startDate.getDate().toString().padStart(2, "0");
  
  return {
    startDate,
    year,
    yearMonth: `${year}${month}`,
    dateString: `${year}${month}${day}`
  };
};
const submitForm = async () => {
  const isValid = await form.value.validate();


  if (!isValid) {
    await CallSwal({
      icon: "error",
      title: "ຂໍ້ມູນບໍ່ຄົບຖ້ວນ",
      text: "ກະລຸນາກວດສອບແລະປ້ອນຂໍ້ມູນທີ່ຈຳເປັນໃຫ້ຄົບຖ້ວນກ່ອນບັນທຶກ",
      confirmButtonText: "ຕົກລົງ",
      showCancelButton: false,
    });
    return;
  }

  const requiredFields = [
    {
      field: faAssetStoreInstance.form_create_fa_asset.asset_type_id,
      name: "ປະເພດຊັບສົມບັດ",
    },
    {
      field: faAssetStoreInstance.form_create_fa_asset.asset_value,
      name: "ມູນຄ່າເລີ່ມຕົ້ນ",
    },
    {
      field: faAssetStoreInstance.form_create_fa_asset.currency_type,
      name: "ສະກຸນເງິນ",
    },
    {
      field: faAssetStoreInstance.form_create_fa_asset.asset_date,
      name: "ວັນທີ່ຊື້",
    },
    {
      field: faAssetStoreInstance.form_create_fa_asset.supplier_id,
      name: "ຜູ້ສະໜອງ",
    },
    {
      field: faAssetStoreInstance.form_create_fa_asset.asset_location_id,
      name: "ສະຖານທີ່ຕັ້ງ",
    },
  ];

  if (faAssetStoreInstance.form_create_fa_asset.has_depreciation === "Y") {
    requiredFields.push(
      {
        field: faAssetStoreInstance.form_create_fa_asset.dpca_type,
        name: "ວິທີຫັກຄ່າເສື່ອມລາຄາ",
      },
      {
        field: faAssetStoreInstance.form_create_fa_asset.asset_useful_life,
        name: "ອາຍຸການໃຊ້ງານ",
      },
      {
        field: faAssetStoreInstance.form_create_fa_asset.type_of_pay,
        name: "ປະເພດການຊຳລະ",
      },
      {
        field: faAssetStoreInstance.form_create_fa_asset.acc_no,
        name: "ເລກບັນຊີ",
      }
    );
  }

  const missingFields = requiredFields.filter(
    (item) => !item.field || item.field === ""
  );

  if (missingFields.length > 0) {
    const missingFieldNames = missingFields
      .map((item) => `• ${item.name}`)
      .join("\n");

    await CallSwal({
      icon: "warning",
      title: "ຂາດຂໍ້ມູນທີ່ຈຳເປັນ",
      html: `ກະລຸນາປ້ອນຂໍ້ມູນໃນຟີລດັ່ງລຸ່ມນີ້:<br><br><div style="text-align: left;">${missingFieldNames.replace(
        /\n/g,
        "<br>"
      )}</div>`,
      confirmButtonText: "ຕົກລົງ",
      showCancelButton: false,
    });
    return;
  }

  if (faAssetStoreInstance.form_create_fa_asset.asset_value <= 0) {
    await CallSwal({
      icon: "error",
      title: "ມູນຄ່າບໍ່ຖືກຕ້ອງ",
      text: "ມູນຄ່າຊັບສົມບັດຕ້ອງມີຄ່າຫຼາຍກວ່າ 0",
      confirmButtonText: "ຕົກລົງ",
      showCancelButton: false,
    });
    return;
  }

  const notification = await CallSwal({
    icon: "warning",
    title: "ຄຳເຕືອນ",
    text: `ທ່ານກຳລັງເພີ່ມຊັບສົມບັດຄົງທີ່ໃໝ່ ທ່ານແນ່ໃຈແລ້ວບໍ່?`,
    showCancelButton: true,
    confirmButtonText: "ຕົກລົງ",
    cancelButtonText: "ຍົກເລີກ",
  });

  if (notification.isConfirmed) {
    try {
      const eodDates = getEodDates();
      faAssetStoreInstance.form_create_fa_asset.Reference_No =
        computedReferenceNo.value;

      const currentDate = new Date();
      const currentYear = currentDate.getFullYear().toString();
      const currentYearMonth = `${currentDate.getFullYear()}${(
        currentDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}`;

      // faAssetStoreInstance.creat_form_jornal = {
      //   Reference_No: computedReferenceNo.value,
      //   Ccy_cd:
      //     faAssetStoreInstance.form_create_fa_asset.currency_type || "LAK",
      //   Txn_code: "UNC",
      //   Value_date: new Date(),
      //   Addl_text:
      //     `ພວມຊື້ພວມກໍ່ສ້າງ${faAssetStoreInstance.form_create_fa_asset.MC_name_la}` ||
      //     "",
      //   fin_cycle: currentYear,
      //   module_id: "AS",
      //   Period_code: currentYearMonth,
      //   entries: [
      //     {
      //       Account: faAssetStoreInstance.form_create_fa_asset.asset_type_id,
      //       Account_no: faAssetStoreInstance.form_create_fa_asset.MC_detail,
      //       Amount: parseFormattedNumber(formattedAssetValue.value),
      //       Dr_cr: "D",
      //       Addl_sub_text: `${faAssetStoreInstance.form_create_fa_asset.asset_spec}`,
      //       Ac_relatives:
      //         faAssetStoreInstance.form_create_fa_asset.asset_list_id,
      //     },
      //     {
      //       Account: null,
      //       Account_no: faAssetStoreInstance.form_create_fa_asset.acc_no,
      //       Amount: parseFormattedNumber(formattedAssetValue.value),
      //       Dr_cr: "C",
      //       Addl_sub_text: `${faAssetStoreInstance.form_create_fa_asset.asset_spec}`,
      //       Ac_relatives:
      //         faAssetStoreInstance.form_create_fa_asset.asset_list_id,
      //     },
      //   ],
      // };
faAssetStoreInstance.creat_form_jornal = {
        Reference_No: computedReferenceNo.value,
        Ccy_cd: faAssetStoreInstance.form_create_fa_asset.currency_type || "LAK",
        Txn_code: "UNC",
        Value_date: eodDates.startDate, 
        Addl_text: `ພວມຊື້ພວມກໍ່ສ້າງ${faAssetStoreInstance.form_create_fa_asset.MC_name_la}` || "",
        fin_cycle: eodDates.year, 
        module_id: "AS",
        Period_code: eodDates.yearMonth, 
        entries: [
          {
            Account: faAssetStoreInstance.form_create_fa_asset.asset_type_id,
            Account_no: faAssetStoreInstance.form_create_fa_asset.MC_detail,
            Amount: parseFormattedNumber(formattedAssetValue.value),
            Dr_cr: "D",
            Addl_sub_text: `${faAssetStoreInstance.form_create_fa_asset.asset_spec}`,
            Ac_relatives: faAssetStoreInstance.form_create_fa_asset.asset_list_id,
          },
          {
            Account: null,
            Account_no: faAssetStoreInstance.form_create_fa_asset.acc_no,
            Amount: parseFormattedNumber(formattedAssetValue.value),
            Dr_cr: "C",
            Addl_sub_text: `${faAssetStoreInstance.form_create_fa_asset.asset_spec}`,
            Ac_relatives: faAssetStoreInstance.form_create_fa_asset.asset_list_id,
          },
        ],
      };
      await faAssetStoreInstance.CreateFaAsset();
      await faAssetStoreInstance.CreateJournal();
      await faAssetStoreInstance.GetFaAssetList()

      CallSwal({
        title: "ສຳເລັດ",
        text: "ສຳເລັດການເພີ່ມຊັບສົມບັດແລະບັນທຶກ Journal",
        icon: "success",
        showCancelButton: false,
        showConfirmButton: false,
      });

      setTimeout(() => {
        goBack();
      }, 2000);
    } catch (error) {
      console.error("Error in submit process:", error);
      CallSwal({
        title: "ຜິດພາດ",
        text: "ມີຂໍ້ຜິດພາດໃນການບັນທຶກຂໍ້ມູນ",
        icon: "error",
        showCancelButton: false,
        confirmButtonText: "ຕົກລົງ",
      });
    }
  }
};

const computedAssetDisplayName = computed(() => {
  const assetTypeId = faAssetStoreInstance.form_create_fa_asset.asset_type_id;
  const mcNameLa = faAssetStoreInstance.form_create_fa_asset.MC_name_la;

  if (!assetTypeId || !mockData.value || !Array.isArray(mockData.value)) {
    return "";
  }

  const selectedAsset = mockData.value.find(
    (asset) => asset && asset.coa_id === assetTypeId
  );

  if (selectedAsset?.asset_name_la && mcNameLa) {
    return `ພວມຊື້ພວມກໍ່ສ້າງ-${mcNameLa}`;
  }

  return mcNameLa || "";
});

const computedAssetSpecName = computed(() => {
  const assetTypeId = faAssetStoreInstance.form_create_fa_asset.asset_type_id;
  const mcNameLa = faAssetStoreInstance.form_create_fa_asset.MC_name_la;

  if (!assetTypeId || !mockData.value || !Array.isArray(mockData.value)) {
    return "";
  }

  const selectedAsset = mockData.value.find(
    (asset) => asset && asset.coa_id === assetTypeId
  );

  if (selectedAsset?.asset_name_la && mcNameLa) {
    return `ພວມຊື້ພວມກໍ່ສ້າງ${mcNameLa} - ${selectedAsset.asset_name_la} - ${selectedAsset.asset_name_la}`;
  }

  return mcNameLa || "";
});
import axios from "@/helpers/axios";
const generateNextAssetCode = async () => {
  try {
    const res = await axios.post(
      `/api/asset_list/generate-next-code/`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (res.data.success) {
      faAssetStoreInstance.form_create_fa_asset.asset_list_code =
        res.data.next_code;
      return res.data.next_code;
    } else {
      throw new Error(res.data.message || "Failed to generate asset code");
    }
  } catch (error) {
    console.error("API Error:", error);
    await CallSwal({
      icon: "error",
      title: "ຜິດພາດ",
      text: "ບໍ່ສາມາດສ້າງລະຫັດຊັບສິນໄດ້",
      confirmButtonText: "ຕົກລົງ",
    });
    return null;
  }
};

// const generateSerialNumber = () => {
//   const selectedAssetTypeId =
//     faAssetStoreInstance.form_create_fa_asset.asset_type_id;
//   const assetListCode =
//     faAssetStoreInstance.form_create_fa_asset.asset_list_code;

//   if (!selectedAssetTypeId || !assetListCode) {
//     return "";
//   }

//   if (!mockData.value || !Array.isArray(mockData.value)) {
//     return "";
//   }

//   const selectedAsset = mockData.value.find(
//     (asset) => asset && asset.coa_id === selectedAssetTypeId
//   );

//   if (!selectedAsset || !selectedAsset.asset_code) {
//     return "";
//   }

//   const assetCode = selectedAsset.asset_code;

//   const now = new Date();
//   const year = now.getFullYear();
//   const month = (now.getMonth() + 1).toString().padStart(2, "0");
//   const day = now.getDate().toString().padStart(2, "0");
//   const dateString = `${year}${month}${day}`;

//   return `SN-${assetCode}-${dateString}-${assetListCode}`;
// };
const generateSerialNumber = () => {
  const selectedAssetTypeId = faAssetStoreInstance.form_create_fa_asset.asset_type_id;
  const assetListCode = faAssetStoreInstance.form_create_fa_asset.asset_list_code;

  if (!selectedAssetTypeId || !assetListCode) {
    return "";
  }

  if (!mockData.value || !Array.isArray(mockData.value)) {
    return "";
  }

  const selectedAsset = mockData.value.find(
    (asset) => asset && asset.coa_id === selectedAssetTypeId
  );

  if (!selectedAsset || !selectedAsset.asset_code) {
    return "";
  }

  const assetCode = selectedAsset.asset_code;
  const { dateString } = getEodDates(); // ໃຊ້ EOD date

  return `SN-${assetCode}-${dateString}-${assetListCode}`;
};

// const generateSerialtag = () => {
//   const selectedAssetTypeId =
//     faAssetStoreInstance.form_create_fa_asset.asset_type_id;
//   const assetListCode =
//     faAssetStoreInstance.form_create_fa_asset.asset_list_code;

//   if (!selectedAssetTypeId || !assetListCode) {
//     return "";
//   }

//   if (!mockData.value || !Array.isArray(mockData.value)) {
//     return "";
//   }

//   const selectedAsset = mockData.value.find(
//     (asset) => asset && asset.coa_id === selectedAssetTypeId
//   );

//   if (!selectedAsset || !selectedAsset.asset_code) {
//     return "";
//   }

//   const assetCode = selectedAsset.asset_code;

//   const now = new Date();
//   const year = now.getFullYear();
//   const month = (now.getMonth() + 1).toString().padStart(2, "0");
//   const day = now.getDate().toString().padStart(2, "0");
//   const dateString = `${year}${month}${day}`;

//   return `BA-${assetCode}-${dateString}-${assetListCode}`;
// };
const generateSerialtag = () => {
  const selectedAssetTypeId = faAssetStoreInstance.form_create_fa_asset.asset_type_id;
  const assetListCode = faAssetStoreInstance.form_create_fa_asset.asset_list_code;

  if (!selectedAssetTypeId || !assetListCode) {
    return "";
  }

  if (!mockData.value || !Array.isArray(mockData.value)) {
    return "";
  }

  const selectedAsset = mockData.value.find(
    (asset) => asset && asset.coa_id === selectedAssetTypeId
  );

  if (!selectedAsset || !selectedAsset.asset_code) {
    return "";
  }

  const assetCode = selectedAsset.asset_code;
  const { dateString } = getEodDates(); // ໃຊ້ EOD date

  return `BA-${assetCode}-${dateString}-${assetListCode}`;
};

// const generateAssetListId = () => {
//   const selectedAssetTypeId =
//     faAssetStoreInstance.form_create_fa_asset.asset_type_id;
//   const assetListCode =
//     faAssetStoreInstance.form_create_fa_asset.asset_list_code;

//   if (!selectedAssetTypeId || !assetListCode) {
//     return "";
//   }

//   if (!mockData.value || !Array.isArray(mockData.value)) {
//     return "";
//   }

//   const selectedAsset = mockData.value.find(
//     (asset) => asset && asset.coa_id === selectedAssetTypeId
//   );

//   if (!selectedAsset || !selectedAsset.asset_code) {
//     return "";
//   }

//   const assetCode = selectedAsset.asset_code;

//   const now = new Date();
//   const year = now.getFullYear();
//   const month = (now.getMonth() + 1).toString().padStart(2, "0");
//   const yearMonth = `${year}${month}`;

//   return `${assetCode}-${yearMonth}-${assetListCode}`;
// };
const generateAssetListId = () => {
  const selectedAssetTypeId = faAssetStoreInstance.form_create_fa_asset.asset_type_id;
  const assetListCode = faAssetStoreInstance.form_create_fa_asset.asset_list_code;

  if (!selectedAssetTypeId || !assetListCode) {
    return "";
  }

  if (!mockData.value || !Array.isArray(mockData.value)) {
    return "";
  }

  const selectedAsset = mockData.value.find(
    (asset) => asset && asset.coa_id === selectedAssetTypeId
  );

  if (!selectedAsset || !selectedAsset.asset_code) {
    return "";
  }

  const assetCode = selectedAsset.asset_code;
  const { yearMonth } = getEodDates(); // ໃຊ້ EOD year-month

  return `${assetCode}-${yearMonth}-${assetListCode}`;
};
const handleTypeOfPayChange = async (selectedValue: any) => {
  if (selectedValue) {
    noaccStore.res_pons_filter.query.gl_code = selectedValue;
    faAssetStoreInstance.form_create_fa_asset.acc_no = "";
    await noaccStore.getSubData();
  }
};

watch(
  () => mockData.value,
  (newMockData) => {
    console.log("📦 MockData changed, length:", newMockData?.length);
    if (
      newMockData &&
      Array.isArray(newMockData) &&
      newMockData.length > 0 &&
      urlAssetCode.value
    ) {
      const foundAsset = newMockData.find(
        (asset) => asset && asset.coa_id === urlAssetCode.value
      );

      if (
        foundAsset &&
        !faAssetStoreInstance.form_create_fa_asset.asset_type_id
      ) {
        faAssetStoreInstance.form_create_fa_asset.asset_type_id =
          urlAssetCode.value;
        console.log(
          "✅ Asset set from mockData watch:",
          urlAssetCode.value,
          "Asset:",
          foundAsset.asset_name_la
        );
      } else if (!foundAsset) {
        console.warn(
          "❌ Asset not found for asset_type_id:",
          urlAssetCode.value
        );
        console.log(
          "📋 Available assets:",
          newMockData.map((a) => ({ coa_id: a.coa_id, name: a.asset_name_la }))
        );
      }
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => route.query.asset_type_id,
  (newAssetTypeId: any) => {
    if (
      newAssetTypeId &&
      newAssetTypeId !== faAssetStoreInstance.form_create_fa_asset.asset_type_id
    ) {
      faAssetStoreInstance.form_create_fa_asset.asset_type_id =
        newAssetTypeId as string;
    }
  },
  { immediate: true }
);

watch(
  [
    () => faAssetStoreInstance.form_create_fa_asset.asset_type_id,
    () => faAssetStoreInstance.form_create_fa_asset.asset_list_code,
  ],
  ([assetTypeId, assetListCode]) => {
    if (assetTypeId && assetListCode) {
      faAssetStoreInstance.form_create_fa_asset.asset_list_id =
        generateAssetListId();
      faAssetStoreInstance.form_create_fa_asset.asset_serial_no =
        generateSerialNumber();
      faAssetStoreInstance.form_create_fa_asset.asset_tag = generateSerialtag();
      faAssetStoreInstance.form_create_fa_asset.Reference_No =
        generateReferenceNo();
    }
  }
);

watch(
  [
    () => faAssetStoreInstance.form_create_fa_asset.dpca_start_date,
    () => faAssetStoreInstance.form_create_fa_asset.asset_useful_life,
  ],
  ([startDate, usefulLife]) => {
    if (startDate && usefulLife) {
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + usefulLife);
      faAssetStoreInstance.form_create_fa_asset.dpca_end_date = endDate
        .toISOString()
        .split("T")[0];
    }
  }
);

watch(
  [
    () => faAssetStoreInstance.form_create_fa_asset.asset_value,
    () => faAssetStoreInstance.form_create_fa_asset.asset_accu_dpca_value,
  ],
  ([assetValue, accuDpcaValue]) => {
    const value = assetValue || 0;
    const accumulated = accuDpcaValue || 0;
    faAssetStoreInstance.form_create_fa_asset.asset_value_remain =
      value - accumulated;
  }
);

watch(
  () => faAssetStoreInstance.form_create_fa_asset.asset_useful_life,
  (newUsefulLife) => {
    if (isAutoCalculating.value) return;

    if (newUsefulLife && newUsefulLife > 0) {
      isAutoCalculating.value = true;
      const percentage = 100 / newUsefulLife;
      faAssetStoreInstance.form_create_fa_asset.dpca_percentage =
        Math.round(percentage * 100) / 100;
      nextTick(() => {
        isAutoCalculating.value = false;
      });
    }
  }
);
const getCurrentDate = () => {
  return new Date();
};

const getCurrentDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Computed property ສຳລັບການສະແດງວັນທີໃນຟອມ
const formattedAssetAcDatetime = computed({
  get: () => {
    const date = faAssetStoreInstance.form_create_fa_asset.asset_ac_datetime;
    if (!date) return "";

    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return date;
  },
  set: (value: string) => {
    if (value) {
      faAssetStoreInstance.form_create_fa_asset.asset_ac_datetime = new Date(
        value
      );
    } else {
      faAssetStoreInstance.form_create_fa_asset.asset_ac_datetime = null;
    }
  },
});
watch(
  () => faAssetStoreInstance.form_create_fa_asset.dpca_percentage,
  (newPercentage) => {
    if (isAutoCalculating.value) return;

    if (newPercentage && newPercentage > 0) {
      isAutoCalculating.value = true;
      const usefulLife = 100 / newPercentage;
      faAssetStoreInstance.form_create_fa_asset.asset_useful_life =
        Math.round(usefulLife);
      nextTick(() => {
        isAutoCalculating.value = false;
      });
    }
  }
);

watch(
  assetcode,
  async (newValue) => {
    if (
      newValue &&
      Array.isArray(newValue) &&
      newValue.length >= 0 &&
      !faAssetStoreInstance.form_create_fa_asset.asset_list_code && // ຍັງບໍ່ມີເລກ
      !isGeneratingCode.value
    ) {
      console.log("🎯 Generating asset code...");

      try {
        isGeneratingCode.value = true; // ລັອກ
        const newCode = await generateNextAssetCode();

        if (newCode) {
          faAssetStoreInstance.form_create_fa_asset.asset_list_code = newCode;

          if (faAssetStoreInstance.form_create_fa_asset.asset_type_id) {
            faAssetStoreInstance.form_create_fa_asset.asset_list_id =
              generateAssetListId();
            faAssetStoreInstance.form_create_fa_asset.asset_serial_no =
              generateSerialNumber();
          }
        }
      } catch (error) {
        console.error("Error generating code:", error);
      } finally {
        isGeneratingCode.value = false;
      }
    } else {
      console.log("🔄 Skipping - already has code or generating in progress");
    }
  },
  { immediate: true }
);

const computedMCDetail = computed(() => {
  const assetTypeId = faAssetStoreInstance.form_create_fa_asset.asset_type_id;
  const assetListCode =
    faAssetStoreInstance.form_create_fa_asset.asset_list_code;

  if (
    !assetTypeId ||
    !assetListCode ||
    !mockData.value ||
    !Array.isArray(mockData.value)
  ) {
    return "";
  }

  const selectedAsset = mockData.value.find(
    (asset) => asset && asset.coa_id === assetTypeId
  );

  if (selectedAsset?.tangible_detail?.MC_detail) {
    return `${selectedAsset.tangible_detail.MC_detail}.${assetListCode}`;
  }

  return "";
});

watch(
  () => faAssetStoreInstance.form_create_fa_asset.asset_type_id,
  (newAssetTypeId) => {
    if (newAssetTypeId && mockData.value && Array.isArray(mockData.value)) {
      const selectedAsset = mockData.value.find(
        (asset) => asset && asset.coa_id === newAssetTypeId
      );

      if (selectedAsset?.tangible_detail) {
        faAssetStoreInstance.form_create_fa_asset.MC_name_la =
          selectedAsset.tangible_detail.MC_name_la || "";

        const specDisplayName =
          selectedAsset.tangible_detail.MC_name_la &&
          selectedAsset.asset_name_la
            ? ` ${selectedAsset.asset_name_la}`
            : selectedAsset.tangible_detail.MC_name_la || "";

        faAssetStoreInstance.form_create_fa_asset.asset_spec = specDisplayName;

        const assetListCode =
          faAssetStoreInstance.form_create_fa_asset.asset_list_code;
        if (assetListCode && selectedAsset.tangible_detail.MC_detail) {
          faAssetStoreInstance.form_create_fa_asset.MC_detail = `${selectedAsset.tangible_detail.MC_detail}.${assetListCode}`;
        }
      }
    } else {
      faAssetStoreInstance.form_create_fa_asset.MC_detail = "";
      faAssetStoreInstance.form_create_fa_asset.MC_name_la = "";
      faAssetStoreInstance.form_create_fa_asset.asset_spec = "";
    }
  }
);

watch(
  () => faAssetStoreInstance.form_create_fa_asset.asset_list_code,
  (newAssetListCode) => {
    const assetTypeId = faAssetStoreInstance.form_create_fa_asset.asset_type_id;

    if (
      assetTypeId &&
      newAssetListCode &&
      mockData.value &&
      Array.isArray(mockData.value)
    ) {
      const selectedAsset = mockData.value.find(
        (asset) => asset && asset.coa_id === assetTypeId
      );

      if (selectedAsset?.tangible_detail?.MC_detail) {
        faAssetStoreInstance.form_create_fa_asset.MC_detail = `${selectedAsset.tangible_detail.MC_detail}.${newAssetListCode}`;
      }
    } else if (!newAssetListCode) {
      faAssetStoreInstance.form_create_fa_asset.MC_detail = "";
    }
  }
);

const formattedMCDetail = computed({
  get: () => {
    return computedMCDetail.value;
  },
  set: (val) => {
    faAssetStoreInstance.form_create_fa_asset.MC_detail = val;
  },
});

watch(
  [
    () => noacc.value,
    () => faAssetStoreInstance.form_create_fa_asset.type_of_pay,
  ],
  async ([newNoacc, newTypeOfPay]) => {
    try {
      if (newTypeOfPay) {
        noaccStore.res_pons_filter.query.gl_code = newTypeOfPay;
        faAssetStoreInstance.form_create_fa_asset.acc_no = "";
        await noaccStore.getSubData();
      } else if (newNoacc && newNoacc.length > 0) {
        noaccStore.res_pons_filter.query.gl_code = newNoacc[0].MC_detail;
        faAssetStoreInstance.form_create_fa_asset.acc_no = "";
        await noaccStore.getSubData();
      }
    } catch (error) {}
  },
  { immediate: true }
);

const rules = {
  required: (value: any) => !!value || "ກະລຸນາປ້ອນຂໍ້ມູນ",
  requiredSelect: (value: any) => !!value || "ກະລຸນາເລືອກຂໍ້ມູນ",
  maxLength50: (value: string) => {
    if (!value) return true;
    return value.length <= 50 || "ຄວາມຍາວບໍ່ເກີນ 50 ຕົວອັກສອນ";
  },
  maxLength500: (value: string) => {
    if (!value) return true;
    return value.length <= 500 || "ຄວາມຍາວບໍ່ເກີນ 500 ຕົວອັກສອນ";
  },
  positiveNumber: (value: number) => {
    if (!value && value !== 0) return true;
    return value >= 0 || "ຄ່າຕ້ອງເປັນຕົວເລກບວກ";
  },
  percentage: (value: number) => {
    if (!value) return true;
    return (value >= 0 && value <= 100) || "ອັດຕາຕ້ອງຢູ່ລະຫວ່າງ 0-100%";
  },
  assetTag: (value: string) => {
    if (!value) return "ກະລຸນາປ້ອນປ້າຍຊັບສິນ";
    const pattern = /^[A-Z0-9\-_]+$/;
    return pattern.test(value) || "ໃຊ້ໄດ້ແຕ່ຕົວອັກສອນພິມໃຫຍ່, ຕົວເລກ, - ແລະ _";
  },
};
const selectedSubglItem = computed(() => {
  const selectedAccNo = faAssetStoreInstance.form_create_fa_asset.acc_no;
  if (!selectedAccNo || !subgl.value || !Array.isArray(subgl.value)) {
    return null;
  }

  return subgl.value.find((item) => item.glsub_code === selectedAccNo);
});

const selectedSubglDesc = computed(() => {
  const selected = selectedSubglItem.value;
  return selected ? selected.glsub_Desc_la : "ເລືອກບັນຊີ";
});
onMounted(async () => {
  try {
    loading.value = true;
    eodStore.GetEOD();
    if (!faAssetStoreInstance.form_create_fa_asset.asset_ac_datetime) {
      faAssetStoreInstance.form_create_fa_asset.asset_ac_datetime =
        getCurrentDate();
    }

    currencyStore.getDataCerrency();
    await Promise.all([
      assetStoreInstance.GetAssetList(),
      faAssetStoreInstance.GetFaAssetList(),
      noaccStore.getModelData(),
      supplierStoreInstance.GetSupplierList(),
      locationStoreInstance.GetLocationList(),
      faAssetStoreInstance.GetAssetCharts(),
      faAssetStoreInstance.GetLocations(),
      faAssetStoreInstance.GetSuppliers(),
    ]);

    console.log("📦 Data loaded, mockData length:", mockData.value?.length);

    // faAssetStoreInstance.form_create_fa_asset.asset_list_code =
    //   generateNextAssetCode();

    await noaccStore.getSubData();

    await nextTick();

    if (
      urlAssetCode.value &&
      mockData.value &&
      Array.isArray(mockData.value) &&
      mockData.value.length > 0
    ) {
      const foundAsset = mockData.value.find(
        (asset) => asset && asset.coa_id === urlAssetCode.value
      );

      if (foundAsset) {
        faAssetStoreInstance.form_create_fa_asset.asset_type_id =
          urlAssetCode.value;
        console.log(
          "🔧 Manually set asset_type_id in onMounted:",
          urlAssetCode.value,
          "Asset:",
          foundAsset.asset_name_la
        );

        await nextTick();
      } else {
        console.warn(
          "❌ Asset not found in onMounted for asset_type_id:",
          urlAssetCode.value
        );
        console.log(
          "📋 Available assets:",
          mockData.value.map((a) => ({
            coa_id: a.coa_id,
            name: a.asset_name_la,
          }))
        );
      }
    }

    console.log(
      "🎯 Final asset_type_id value:",
      faAssetStoreInstance.form_create_fa_asset.asset_type_id
    );
    console.log("Location data:", location.value?.length);
    console.log("Supplier data:", supplier.value?.length);
    console.log("NoAcc data:", noacc.value?.length);
    console.log("SubGL data:", subgl.value?.length);
  } catch (error) {
    console.error("Error loading reference data:", error);
    CallSwal({
      title: "ຜິດພາດ",
      text: "ມີຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນອ້າງອີງ",
      icon: "error",
      confirmButtonText: "ຕົກລົງ",
    });
  } finally {
    loading.value = false;
  }
});
</script>
<template>
  <section class="pa-6">
    <v-form ref="form" @submit.prevent="submitForm">
      <v-row>
        <v-col cols="12">
          <GlobalTextTitleLine :title="title" />
        </v-col>
        <!-- <pre>{{ eodData }}</pre> -->
        <v-col cols="12" class="">
          <v-row>
            <v-col cols="12">
              <v-card
                variant="outlined"
                class=""
                style="border: 2px solid #4caf50"
              >
                <v-card-title class="text-h6 pb-2 bg-success">
                  <v-icon class="mr-2">mdi-information</v-icon>
                  ຂໍ້ມູນພື້ນຖານຊັບສົມບັດ
                </v-card-title>
                <v-card-text class="pt-4">
                  <v-row>
                    <v-col cols="12" md="4">
                      <label
                        >ລາຍການປະເພດຊັບສົມບັດຍອ່ຍ
                        <span class="text-error">*</span></label
                      >

                      <v-autocomplete
                        :loading="faAssetStoreInstance.isLoading"
                        v-model="
                          faAssetStoreInstance.form_create_fa_asset
                            .asset_type_id
                        "
                        :rules="[rules.requiredSelect]"
                        :items="mockData || []"
                        item-title="asset_name_la"
                        item-value="coa_id"
                        placeholder="ເລືອກຊັບສົມບັດ"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        :disabled="!mockData || !mockData.length"
                      >
                        <template v-slot:selection="{ item }">
                          {{ item.raw.asset_name_la }} ({{
                            item.raw.asset_code
                          }})
                        </template>

                        <template v-slot:item="{ props, item }">
                          <v-list-item
                            v-bind="props"
                            :title="`${item.raw.asset_name_la} (${item.raw.asset_code})`"
                          />
                        </template>
                      </v-autocomplete>

                      <label>
                        ລຳດັບ (Asset Code)
                        <span class="text-error">*</span></label
                      >
                      <v-text-field
                        v-model="
                          faAssetStoreInstance.form_create_fa_asset
                            .asset_list_code
                        "
                        :rules="[
                          rules.required,
                          rules.assetTag,
                          rules.maxLength50,
                        ]"
                        placeholder="ເຊັ່ນ: 0001,0002"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        maxlength="50"
                        hint="ສ້າງອັດຕະໂນມັດ"
                        readonly
                        prepend-inner-icon="mdi-auto-fix"
                      ></v-text-field>
                      <label
                        >ປ້າຍຊັບສິນ (Asset Tag)
                        <span class="text-error">*</span></label
                      >
                      <v-text-field
                        v-model="
                          faAssetStoreInstance.form_create_fa_asset.asset_tag
                        "
                        :rules="[
                          rules.required,
                          rules.assetTag,
                          rules.maxLength50,
                        ]"
                        placeholder="ເຊັ່ນ: IT-001, MACH-2024-001"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        maxlength="50"
                        hint="ໃຊ້ໄດ້ແຕ່ຕົວອັກສອນພິມໃຫຍ່, ຕົວເລກ, - ແລະ _"
                      ></v-text-field>
                    </v-col>

                    <v-col cols="12" md="4">
                      <label>ລະຫັດ <span class="text-error">*</span></label>
                      <v-text-field
                        v-model="
                          faAssetStoreInstance.form_create_fa_asset
                            .asset_list_id
                        "
                        :rules="[rules.required, rules.maxLength50]"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        maxlength="50"
                        hint="ສ້າງອັດຕະໂນມັດ"
                        readonly
                        prepend-inner-icon="mdi-auto-fix"
                        placeholder="ເຊັ່ນ: FIX-001-202506-0002"
                      ></v-text-field>

                      <!-- <label>ເລກອ້າງອີງ (Reference No) <span class="text-error">*</span></label>
                      <v-text-field
                        :value="computedReferenceNo"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        hint="ສ້າງອັດຕະໂນມັດ: AS-UNC-ວັນເດືອນປີ-AssetCode"
                        readonly
                        prepend-inner-icon="mdi-auto-fix"
                        placeholder="ເຊັ່ນ: AS-UNC-28062025-0001"
                      ></v-text-field> -->

                      <label
                        >ເລກຊີຣີ (Serial Number)<span class="text-error"
                          >*</span
                        ></label
                      >
                      <v-text-field
                        v-model="
                          faAssetStoreInstance.form_create_fa_asset
                            .asset_serial_no
                        "
                        :rules="[rules.maxLength50]"
                        placeholder="ເຊັ່ນ: SN-FIX-001-20250623-0001"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        maxlength="50"
                        hint="ສ້າງອັດຕະໂນມັດ"
                        readonly
                        prepend-inner-icon="mdi-auto-fix"
                        requeired
                      ></v-text-field>
                      <label
                        >ສະຖານທີ່ຕັ້ງ<span class="text-error">*</span></label
                      >
                      <v-autocomplete
                        v-model="
                          faAssetStoreInstance.form_create_fa_asset
                            .asset_location_id
                        "
                        :items="location || []"
                        item-title="location_name_la"
                        item-value="location_id"
                        placeholder="ເລືອກສະຖານທີ່ຕັ້ງຊັບສົມບັດ"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        clearable
                        :rules="[rules.required]"
                        :disabled="!location || !location.length"
                      >
                        <template v-slot:selection="{ item }">
                          {{ item.raw.location_name_la }} ({{
                            item.raw.location_code
                          }})
                        </template>

                        <template v-slot:item="{ props, item }">
                          <v-list-item
                            v-bind="props"
                            :title="`${item.raw.location_name_la} (${item.raw.location_code})`"
                          />
                        </template>
                      </v-autocomplete>
                    </v-col>
                    <v-col cols="12" md="4">
                      <label
                        >ລາຍລະອຽດຄຸນລັກສະນະ<span class="text-error"
                          >*</span
                        ></label
                      >
                      <v-textarea
                        v-model="
                          faAssetStoreInstance.form_create_fa_asset.asset_spec
                        "
                        :rules="[rules.maxLength500, rules.required]"
                        placeholder="ບັນລະອຽດຄຸນລັກສະນະຂອງຊັບສົມບັດ"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        rows="3"
                        maxlength="500"
                        counter
                      ></v-textarea>
                      <label
                        >ປະເພດຊັບສິນຄົງທີ່<span class="text-error"
                          >*</span
                        ></label
                      >
                      <v-text-field
                        :rules="[rules.required]"
                        :value="computedAssetDisplayName"
                        placeholder="ຊັບສົມບັດພວມຊື້ພວມກໍ່ສ້າງ - ປະເພດຊັບສິນ"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        readonly
                        prepend-inner-icon="mdi-auto-fix"
                        hint="ສ້າງອັດຕະໂນມັດຈາກການເລືອກປະເພດຊັບສິນ"
                      >
                      </v-text-field>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-card
                variant="outlined"
                class=""
                style="border: 2px solid #ffc107"
              >
                <v-card-title class="text-h6 pb-2 bg-warning text-dark">
                  <v-icon class="mr-2">mdi-shield-check</v-icon>
                  ສະຖານະແລະການຮັບປະກັນ
                </v-card-title>
                <v-card-text class="pt-4">
                  <v-row>
                    <v-col cols="12" md="3">
                      <label
                        >ມູນຄ່າເລີ່ມຕົ້ນ
                        <span class="text-error">*</span></label
                      >
                      <v-text-field
                        v-model="formattedAssetValue"
                        :rules="[rules.required, rules.positiveNumber]"
                        placeholder="0"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        prefix="₭"
                        class="formatted-number-input"
                      ></v-text-field
                    ></v-col>
                    <v-col cols="12" md="3">
                      <label>ມູນຄ່າຊາກ <span class="text-error">*</span></label>
                      <v-text-field
                        v-model="formattedSalvageValue"
                        :rules="[rules.required]"
                        placeholder="0"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        prefix="₭"
                        class="formatted-number-input"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="2">
                      <label>ສະກຸນເງິນ<span class="text-error">*</span></label>
                      <v-autocomplete
                        v-model="
                          faAssetStoreInstance.form_create_fa_asset
                            .currency_type
                        "
                        :items="currency"
                        item-title="Ccy_Name_la"
                        item-value="ccy_code"
                        placeholder="ເລືອກສະກຸນເງິນ"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        :disabled="!currency || currency.length === 0"
                        :rules="[rules.requiredSelect, rules.required]"
                      >
                        <template v-slot:selection="{ item }">
                          {{ item.raw.Ccy_Name_la }} ({{ item.raw.ccy_code }})
                        </template>

                        <template v-slot:item="{ props, item }">
                          <v-list-item
                            v-bind="props"
                            :title="`${item.raw.Ccy_Name_la} (${item.raw.ccy_code})`"
                          />
                        </template>
                      </v-autocomplete>
                    </v-col>
                    <v-col cols="12" md="2">
                      <label
                        >ມືຊື້ຊັບສົມບັດ <span class="text-error">*</span></label
                      >
                      <v-text-field
                        v-model="
                          faAssetStoreInstance.form_create_fa_asset.asset_date
                        "
                        :rules="[rules.required]"
                        type="date"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="2">
                      <label
                        >ຜູ້ສະໜອງ/ຜູ້ຂາຍ<span class="text-error">*</span></label
                      >
                      <v-select
                        v-model="
                          faAssetStoreInstance.form_create_fa_asset.supplier_id
                        "
                        :items="supplier || []"
                        item-title="supplier_name"
                        item-value="supplier_id"
                        placeholder="ເລືອກຜູ້ສະໜອງ"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        clearable
                        :rules="[rules.requiredSelect]"
                        :disabled="!supplier || !supplier.length"
                      >
                        <template v-slot:selection="{ item }">
                          {{ item.raw.supplier_name }}({{
                            item.raw.supplier_code
                          }})
                        </template>

                        <template v-slot:item="{ props, item }">
                          <v-list-item
                            v-bind="props"
                            :title="`${item.raw.supplier_name}(${item.raw.supplier_code})`"
                          />
                        </template>
                      </v-select>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col
              cols="12"
              v-show="
                faAssetStoreInstance.form_create_fa_asset.has_depreciation ===
                'Y'
              "
            >
              <v-card
                variant="outlined"
                class="mb-6"
                style="border: 2px solid #9c27b0"
              >
                <v-card-title class="text-h6 pb-2 bg-purple text-white">
                  <v-icon class="mr-2">mdi-calculator</v-icon>
                  ຂໍ້ມູນການເສື່ອມລາຄາ
                </v-card-title>
                <v-card-text class="pt-4">
                  <v-row>
                    <v-col cols="12" md="3">
                      <label
                        >ວິທີຫັກຄ່າຫຼຸຍຫຽ້ນ<span class="text-error"
                          >*</span
                        ></label
                      >
                      <v-autocomplete
                        v-model="
                          faAssetStoreInstance.form_create_fa_asset.dpca_type
                        "
                        :rules="[rules.requiredSelect, rules.required]"
                        placeholder="ເຊັ່ນ: SL, DB, UOP"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        hint="SL=ເສັ້ນກົງ, DB=ລົດລົງ, UOP=ຫົວໜ່ວຍຜະລິດ"
                        :items="doca_type || []"
                        item-title="title"
                        item-value="value"
                      ></v-autocomplete>
                      <label
                        >ອາຍຸການໃຊ້ງານ (ປີ)<span class="text-error"
                          >*</span
                        ></label
                      >
                      <v-text-field
                        v-model.number="
                          faAssetStoreInstance.form_create_fa_asset
                            .asset_useful_life
                        "
                        :rules="[rules.positiveNumber, rules.required]"
                        type="number"
                        min="1"
                        placeholder="0"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        suffix="ປີ"
                        hint="ປ້ອນອາຍຸການໃຊ້ງານເພື່ອຄິດໄລ່ອັດຕາອັດຕະໂນມັດ"
                      ></v-text-field>
                      <label>ອັດຕາຄ່າຫຼູຍຫຽ້ນລາຄາ (%)</label>
                      <v-text-field
                        v-model.number="
                          faAssetStoreInstance.form_create_fa_asset
                            .dpca_percentage
                        "
                        :rules="[rules.percentage]"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        placeholder="0.00"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        suffix="%"
                        hint="ປ້ອນອັດຕາເພື່ອຄິດໄລ່ອາຍຸການໃຊ້ງານອັດຕະໂນມັດ"
                      ></v-text-field>
                      <label>ວັນທີ່ເລີ່ມຄິດລາຄາຫຼູ້ຍຫຽ້ນ</label>
                      <v-text-field
                        v-model="
                          faAssetStoreInstance.form_create_fa_asset
                            .dpca_start_date
                        "
                        type="date"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        :disabled="true"
                      ></v-text-field>
                      <label
                        >ວັນທີລົງບັນຊີ
                        <span class="text-success">*</span></label
                      >
                      <v-text-field
                        v-model="formattedAssetAcDatetime"
                        type="date"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        readonly
                        hidden
                        disabled
                        prepend-inner-icon="mdi-calendar-today"
                        hint="ວັນທີປະຈຸບັນ (ຕັ້ງອັດຕະໂນມັດ)"
                        class="auto-date-field"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <label
                        >ປະເພດການຊຳລະ<span class="text-error">*</span></label
                      >
                      <v-autocomplete
                        v-model="
                          faAssetStoreInstance.form_create_fa_asset.type_of_pay
                        "
                        :rules="[rules.requiredSelect, rules.required]"
                        :items="noacc || []"
                        item-value="MC_detail"
                        item-title="MC_name_la"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        placeholder="ເລືອກປະເພດການຊຳລະ"
                        :disabled="!noacc || !noacc.length"
                      >
                        <template v-slot:selection="{ item }">
                          {{ item.raw.MC_name_la }}
                        </template>

                        <template v-slot:item="{ props, item }">
                          <v-list-item
                            v-bind="props"
                            :title="item.raw.MC_name_la"
                            :subtitle="item.raw.MC_detail"
                          />
                        </template>
                      </v-autocomplete>

                      <label
                        >ມູນຄ່າຕໍ່ເດືອນ<span class="text-error">*</span></label
                      >
                      <v-text-field
                        :rules="[rules.required]"
                        :value="formattedAssetValueRemainMonth"
                        placeholder="ເຊັ່ນ: 1,000,000"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        hint="ສ້າງອັດຕະໂນມັດ"
                        readonly
                        prefix="₭"
                        class="formatted-number-input"
                      ></v-text-field>
                      <label>ມູນຄ່າຄົງເຫຼືອ</label>
                      <v-text-field
                        :value="formattedAssetValueRemain"
                        placeholder="0"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        prefix="₭"
                        readonly
                        hint="ຄິດໄລ່ອັດຕະໂນມັດ: ມູນຄ່າຊັບສິນ - ເສື່ອມລາຄາສະສົມ"
                        class="formatted-number-input"
                        :disabled="true"
                      ></v-text-field>

                      <label>ວັນທີ່ສິ້ນສຸດການລາຄາຫຼູຍຫຽ້ນ</label>
                      <v-text-field
                        v-model="
                          faAssetStoreInstance.form_create_fa_asset
                            .dpca_end_date
                        "
                        type="date"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        readonly
                        hint="ຄິດໄລ່ອັດຕະໂນມັດຈາກວັນທີ່ເລີ່ມແລະອາຍຸການໃຊ້ງານ"
                        :disabled="true"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <label
                        >ເລກບັນຊີ/DR <span class="text-error">*</span></label
                      >
                      <v-text-field
                        v-model="
                          faAssetStoreInstance.form_create_fa_asset.MC_detail
                        "
                        readonly
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                      ></v-text-field>
                      <label>ມູນຄ່າຕັ້ນ</label>
                      <v-text-field
                        :value="
                          faAssetStoreInstance.form_create_fa_asset
                            .asset_value_remainBegin
                        "
                        placeholder="ມູນຄ່າຕົ້ນ"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        readonly
                        prefix="₭"
                        class="formatted-number-input"
                        :disabled="true"
                      ></v-text-field>
                      <label>ມູນຄ່າຫຼູ້ຍຫຽ້ນລາຄາສະສົມ</label>
                      <v-text-field
                        :disabled="true"
                        v-model="formattedAccuDpcaValue"
                        :rules="[rules.positiveNumber]"
                        placeholder="0"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        prefix="₭"
                        readonly
                        class="formatted-number-input"
                      ></v-text-field>

                      <label>ວັນທີ່ຖອນຈຳໜ່າຍຊັບສົມບັດ</label>
                      <v-text-field
                        :disabled="true"
                        v-model="
                          faAssetStoreInstance.form_create_fa_asset
                            .asset_disposal_date
                        "
                        type="date"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" md="3">
                      <label>
                        ເລກບັນຊີ/CR
                        <span class="text-error">*</span>
                        <span v-if="selectedSubglItem" class="text-primary">
                          ({{ selectedSubglItem.glsub_Desc_la }})
                        </span>
                        <span v-else class="text-grey"> (ເລືອກບັນຊີ) </span>
                      </label>
                      <v-autocomplete
                        v-model="
                          faAssetStoreInstance.form_create_fa_asset.acc_no
                        "
                        :items="subgl || []"
                        density="compact"
                        variant="outlined"
                        item-title="glsub_code"
                        item-value="glsub_code"
                        hide-details="auto"
                        placeholder="ເລືອກເລກບັນຊີ"
                        :disabled="!subgl || !subgl.length"
                      >
                      </v-autocomplete>

                      <label>ມູນຄ່າທ້າຍ</label>
                      <v-text-field
                        :disabled="true"
                        :value="formattedAssetValueRemainLast"
                        placeholder="ເຊັ່ນ: 1,000,000"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                        hint="ສ້າງອັດຕະໂນມັດ"
                        readonly
                        prefix="₭"
                        class="formatted-number-input"
                      ></v-text-field>
                      <label>ວັນທີ່ເສື່ອມລາຄາຄັ້ງລາສຸດ</label>
                      <v-text-field
                        v-model="
                          faAssetStoreInstance.form_create_fa_asset
                            .asset_latest_date_dpca
                        "
                        :disabled="true"
                        type="date"
                        density="compact"
                        variant="outlined"
                        hide-details="auto"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" class="d-flex flex-wrap justify-center mt-6">
              <v-btn
                color="error"
                variant="outlined"
                @click="goBack"
                class="mr-2"
                :disabled="faAssetStoreInstance.isLoading"
              >
                ຍົກເລີກ
              </v-btn>

              <v-btn
                color="primary"
                type="submit"
                :loading="faAssetStoreInstance.isLoading"
                prepend-icon="mdi-content-save"
              >
                ບັນທຶກ
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-form>
  </section>
</template>

<style scoped>
.v-text-field input[type="number"] {
  -moz-appearance: textfield;
}

.v-text-field input[type="number"]::-webkit-outer-spin-button,
.v-text-field input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.formatted-number-input .v-field__input {
  text-align: right;
  font-family: "Roboto Mono", monospace;
  font-weight: 500;
}

.formatted-number-input .v-field__input input {
  text-align: right;
}

label {
  font-size: 14px;
  font-weight: 500;
  color: #1976d2;
  margin-bottom: 4px;
  display: block;
}

.pb-4 {
  margin-bottom: 16px;
}

.bg-success {
  background-color: #eceeec !important;
}

.bg-warning {
  background-color: #dad2bc !important;
}

.bg-purple {
  background-color: #ccaed1 !important;
}

.bg-purple-lighten-2 {
  background-color: #ce93d8 !important;
}

.text-white {
  color: white !important;
}

.text-dark {
  color: rgba(0, 0, 0, 0.87) !important;
}
</style>
