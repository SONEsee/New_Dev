export const useBalanceSheet = () => {
  const { $fetch } = useNuxtApp();
  
  const loading = ref(false);
  const error = ref(null);
  
  const getBalanceSheet = async (segment, currency) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await $fetch('/api/balance-sheet/', {
        method: 'POST',
        body: {
          segment: segment,
          currency: currency
        }
      });
      
      return response;
    } catch (err) {
      error.value = err.data?.message || 'ຜິດພາດໃນການດຶງຂໍ້ມູນ';
      throw err;
    } finally {
      loading.value = false;
    }
  };
  
  const getSupportedOptions = async () => {
    try {
      const response = await $fetch('/api/balance-sheet/supported_segments/');
      return response.data;
    } catch (err) {
      error.value = err.data?.message || 'ຜິດພາດໃນການດຶງຂໍ້ມູນທີ່ຮອງຮັບ';
      throw err;
    }
  };
  
  return {
    getBalanceSheet,
    getSupportedOptions,
    loading: readonly(loading),
    error: readonly(error)
  };
};