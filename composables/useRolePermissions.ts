// composables/useRolePermissions.ts
import { computed, onMounted } from 'vue';


export interface RolePermissions {
  View_Detail: number;
  Edit_Detail: number;
  Del_Detail: number;
  Auth_Detail: number;
  New_Detail?: number;
  [key: string]: any;
}

export const useRolePermissions = () => {
  const roleStore = RoleStore();

  // Get role details on mount
  const initializeRole = async () => {
    try {
      await roleStore.GetRoleDetail();
    } catch (error) {
      console.error('Error fetching role details:', error);
    }
  };

  // Computed role data
  const roleData = computed(() => {
    return roleStore.responst_data_detail;
  });

  const permissions = computed((): RolePermissions | null => {
    const data = roleData.value;
    return data?.[0] || null;
  });

  // Permission checkers
  const canView = computed(() => permissions.value?.View_Detail === 1);
  const canEdit = computed(() => permissions.value?.Edit_Detail === 1);
  const canDelete = computed(() => permissions.value?.Del_Detail === 1);
  const canAuthorize = computed(() => permissions.value?.Auth_Detail === 1);
  const canAdd = computed(() => permissions.value?.New_Detail === 1);

  // Generic permission checker
  const hasPermission = (permissionKey: keyof RolePermissions): boolean => {
    return permissions.value?.[permissionKey] === 1;
  };

  // Check multiple permissions
  const hasAnyPermission = (permissionKeys: (keyof RolePermissions)[]): boolean => {
    return permissionKeys.some(key => hasPermission(key));
  };

  const hasAllPermissions = (permissionKeys: (keyof RolePermissions)[]): boolean => {
    return permissionKeys.every(key => hasPermission(key));
  };

  return {
    // Data
    roleStore,
    roleData,
    permissions,
    
    // Methods
    initializeRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Specific permissions
    canView,
    canEdit,
    canDelete,
    canAuthorize,
    canAdd,
  };
};