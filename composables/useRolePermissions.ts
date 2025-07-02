// composables/useRolePermissions.ts
import { computed, onMounted } from 'vue';


export interface RolePermissions {
  View_Detail: number;
  Edit_Detail: number;
  Del_Detail: number;
  Auth_Detail: number;
  New_Detail?: number;
  Auth_Status?: number;
  Record_Status?: string;
  [key: string]: any;
}

export const useRolePermissions = () => {
  const roleStore = RoleStore();

 
  const initializeRole = async () => {
    try {
      await roleStore.GetRoleDetail();
    } catch (error) {
      console.error('Error fetching role details:', error);
    }
  };

  
  const roleData = computed(() => {
    return roleStore.responst_data_detail;
  });

  const permissions = computed((): RolePermissions | null => {
    const data = roleData.value;
    return data?.[0] || null;
  });

 
  const canView = computed(() => permissions.value?.View_Detail === 1);
  const canEdit = computed(() => permissions.value?.Edit_Detail === 1);
  const canDelete = computed(() => permissions.value?.Del_Detail === 1);
  const canAuthorize = computed(() => permissions.value?.Auth_Detail === 1);
  const canAdd = computed(() => permissions.value?.New_Detail === 1);
  const canAuthStatus = computed(() => permissions.value?.Auth_Status === 0);
  const canRecordStatus = computed(() => permissions.value?.Record_Status === 'O');

  
  const hasPermission = (permissionKey: keyof RolePermissions): boolean => {
    return permissions.value?.[permissionKey] === 1;
  };

  
  const hasAnyPermission = (permissionKeys: (keyof RolePermissions)[]): boolean => {
    return permissionKeys.some(key => hasPermission(key));
  };

  const hasAllPermissions = (permissionKeys: (keyof RolePermissions)[]): boolean => {
    return permissionKeys.every(key => hasPermission(key));
  };

  return {
    
    roleStore,
    roleData,
    permissions,
    
    
    initializeRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
   
    canView,
    canEdit,
    canDelete,
    canAuthorize,
    canAdd,
    canAuthStatus,
    canRecordStatus
  };
};