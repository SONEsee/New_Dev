
import { ref } from 'vue';
import { CallSwal } from '~/composables/global';

interface StatusToggleOptions {
  title?: string;
  entityName?: string; 
  activeLabel?: string;
  inactiveLabel?: string;
  activeColor?: string;
  inactiveColor?: string;
  activeIcon?: string;
  inactiveIcon?: string;
  confirmCallback?: (newStatus: string) => Promise<boolean>;
  onSuccess?: (newStatus: string) => void;
  onError?: (error: any) => void;
}

export const useStatusToggle = () => {
  const isUpdating = ref(false);

  const toggleStatus = async (
    currentItem: any,
    options: StatusToggleOptions = {}
  ) => {
    const {
      title = 'ປ່ຽນສະຖານະ',
      entityName = 'ລາຍການ',
      activeLabel = 'ເປີດໃຊ້ງານ',
      inactiveLabel = 'ປິດໃຊ້ງານ',
      activeColor = '#4CAF50',
      inactiveColor = '#f44336',
      activeIcon = '🟢',
      inactiveIcon = '🔴',
      confirmCallback,
      onSuccess,
      onError
    } = options;

    try {
      const currentStatus = currentItem.Auth_Status || currentItem.status || currentItem.is_active;
      const displayName = currentItem.user_name || 
                         currentItem.name || 
                         currentItem.title || 
                         currentItem.division_name_la ||
                         currentItem.role_name_la ||
                         'ລາຍການນີ້';

      const { value: newStatus } = await CallSwal({
        title: `${title}${entityName}`,
        html: `
          <div style="text-align: center; padding: 20px;">
            <p style="margin-bottom: 20px;">${entityName}: <strong>${displayName}</strong></p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
              <label style="
                display: flex; align-items: center; justify-content: center; gap: 10px; 
                cursor: pointer; padding: 15px; 
                border: 3px solid ${currentStatus === 'A' ? activeColor : '#ddd'}; 
                border-radius: 12px;
                background-color: ${currentStatus === 'A' ? activeColor + '15' : '#f9f9f9'};
                transition: all 0.3s ease;
              " onmouseover="this.style.backgroundColor='${activeColor}20'" onmouseout="this.style.backgroundColor='${currentStatus === 'A' ? activeColor + '15' : '#f9f9f9'}'">
                <input type="radio" name="status" value="A" ${currentStatus === 'A' ? 'checked' : ''} style="margin: 0; transform: scale(1.2);">
                <span style="color: ${activeColor}; font-weight: bold; font-size: 16px;">${activeIcon} ${activeLabel}</span>
              </label>
              
              <label style="
                display: flex; align-items: center; justify-content: center; gap: 10px; 
                cursor: pointer; padding: 15px; 
                border: 3px solid ${currentStatus === 'U' ? inactiveColor : '#ddd'}; 
                border-radius: 12px;
                background-color: ${currentStatus === 'U' ? inactiveColor + '15' : '#f9f9f9'};
                transition: all 0.3s ease;
              " onmouseover="this.style.backgroundColor='${inactiveColor}20'" onmouseout="this.style.backgroundColor='${currentStatus === 'U' ? inactiveColor + '15' : '#f9f9f9'}'">
                <input type="radio" name="status" value="U" ${currentStatus === 'U' ? 'checked' : ''} style="margin: 0; transform: scale(1.2);">
                <span style="color: ${inactiveColor}; font-weight: bold; font-size: 16px;">${inactiveIcon} ${inactiveLabel}</span>
              </label>
            </div>
            
            <p style="margin-top: 20px; color: #666; font-size: 14px;">
              ເລືອກສະຖານະທີ່ທ່ານຕ້ອງການ
            </p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: '✅ ບັນທຶກ',
        cancelButtonText: '❌ ຍົກເລີກ',
        confirmButtonColor: activeColor,
        focusConfirm: false,
        customClass: {
          popup: 'status-toggle-popup',
          confirmButton: 'status-confirm-btn',
          cancelButton: 'status-cancel-btn'
        },
        preConfirm: () => {
          const selected = document.querySelector('input[name="status"]:checked') as HTMLInputElement;
          return selected?.value;
        }
      });

      if (newStatus && newStatus !== currentStatus) {
        isUpdating.value = true;
        
        
        if (confirmCallback) {
          const success = await confirmCallback(newStatus);
          if (!success) {
            throw new Error('Failed to update status');
          }
        }
        
       
        if (currentItem.Auth_Status !== undefined) currentItem.Auth_Status = newStatus;
        if (currentItem.status !== undefined) currentItem.status = newStatus;
        if (currentItem.is_active !== undefined) currentItem.is_active = newStatus;
        
       
        await CallSwal({
          icon: "success",
          title: "🎉 ສຳເລັດ",
          text: `${newStatus === 'A' ? activeLabel : inactiveLabel}${entityName}ແລ້ວ`,
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'success-popup'
          }
        });
        
       
        if (onSuccess) {
          onSuccess(newStatus);
        }
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error("Error updating status:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "ບໍ່ສາມາດປ່ຽນສະຖານະໄດ້";
      
      await CallSwal({
        icon: "error",
        title: "⚠️ ເກີດຂໍ້ຜິດພາດ",
        text: errorMessage,
        confirmButtonText: "ຕົກລົງ",
        customClass: {
          popup: 'error-popup'
        }
      });
      
      
      if (onError) {
        onError(error);
      }
      
      return false;
    } finally {
      isUpdating.value = false;
    }
  };

 
  const approveReject = async (
    currentItem: any,
    options: StatusToggleOptions & { 
      approveLabel?: string;
      rejectLabel?: string;
      approveIcon?: string;
      rejectIcon?: string;
    } = {}
  ) => {
    const {
      title = 'ອະນຸມັດຫຼືປະຕິເສດ',
      entityName = 'ລາຍການ',
      approveLabel = 'ອະນຸມັດ',
      rejectLabel = 'ປະຕິເສດ',
      approveIcon = '✅',
      rejectIcon = '❌',
      confirmCallback,
      onSuccess,
      onError
    } = options;

    return await toggleStatus(currentItem, {
      title,
      entityName,
      activeLabel: approveLabel,
      inactiveLabel: rejectLabel,
      activeColor: '#4CAF50',
      inactiveColor: '#f44336',
      activeIcon: approveIcon,
      inactiveIcon: rejectIcon,
      confirmCallback,
      onSuccess,
      onError
    });
  };

  
  const activeInactive = async (
    currentItem: any,
    options: StatusToggleOptions = {}
  ) => {
    return await toggleStatus(currentItem, {
      activeLabel: 'ເປີດໃຊ້ງານ',
      inactiveLabel: 'ປິດໃຊ້ງານ',
      activeIcon: '🟢',
      inactiveIcon: '🔴',
      ...options
    });
  };

  return {
    isUpdating: readonly(isUpdating),
    toggleStatus,
    approveReject,
    activeInactive
  };
};

// ປະເພດຂໍ້ມູນສຳລັບ TypeScript
export interface StatusItem {
  Auth_Status?: 'A' | 'U';
  status?: 'A' | 'U';
  is_active?: 'A' | 'U' | 'Y' | 'N';
  user_name?: string;
  name?: string;
  title?: string;
  division_name_la?: string;
  role_name_la?: string;
  [key: string]: any;
}