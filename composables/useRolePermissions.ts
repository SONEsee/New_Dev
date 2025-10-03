// composables/useRolePermissions.ts
import { computed, ref, watch } from 'vue';

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
  
  // Track initialization state
  const isInitialized = ref(false);
  const initializationError = ref<string | null>(null);

  /**
   * Initialize role permissions with sub_menu_id
   * IMPORTANT: Must be called with sub_menu_id before using permissions
   */
  const initializeRole = async (subMenuId?: string, forceReload = false) => {
    try {
      initializationError.value = null;
      
      // Set sub_menu_id if provided
      if (subMenuId) {
        roleStore.setSubMenuId(subMenuId);
      }
      
      // Validate sub_menu_id is set
      if (!roleStore.filter_role_id.query.sub_menu_id) {
        const error = 'Sub Menu ID is required for permission check';
        console.error(error);
        initializationError.value = error;
        return false;
      }
      
      console.log('Initializing role permissions with:', {
        role_id: roleStore.filter_role_id.query.role_id,
        sub_menu_id: roleStore.filter_role_id.query.sub_menu_id,
        forceReload
      });
      
      // Load role details
      await roleStore.GetRoleDetail(forceReload);
      
      // Check if load was successful
      if (roleStore.filter_role_id.error) {
        initializationError.value = roleStore.filter_role_id.error;
        return false;
      }
      
      isInitialized.value = true;
      console.log('Role permissions initialized successfully');
      return true;
      
    } catch (error: any) {
      console.error('Error initializing role permissions:', error);
      initializationError.value = error.message || 'Failed to initialize permissions';
      isInitialized.value = false;
      return false;
    }
  };

  // Computed: Role data from store
  const roleData = computed(() => {
    return roleStore.responst_data_detail;
  });

  // Computed: Permissions object (first item from array)
  const permissions = computed((): RolePermissions | null => {
    const data = roleData.value;
    return data?.[0] || null;
  });

  // Computed: Is loading
  const isLoading = computed(() => {
    return roleStore.isloading || roleStore.filter_role_id.isloading;
  });

  // Computed: Is ready (loaded and no errors)
  const isReady = computed(() => {
    return roleStore.isPermissionsReady && isInitialized.value && !initializationError.value;
  });

  // Permission checks - with safety guards
  const canView = computed(() => {
    if (!isReady.value) {
      console.warn('Permissions not ready, canView returning false');
      return false;
    }
    return permissions.value?.View_Detail === 1;
  });

  const canEdit = computed(() => {
    if (!isReady.value) return false;
    return permissions.value?.Edit_Detail === 1;
  });

  const canDelete = computed(() => {
    if (!isReady.value) return false;
    return permissions.value?.Del_Detail === 1;
  });

  const canAuthorize = computed(() => {
    if (!isReady.value) return false;
    return permissions.value?.Auth_Detail === 1;
  });

  const canAdd = computed(() => {
    if (!isReady.value) return false;
    return permissions.value?.New_Detail === 1;
  });

  const canAuthStatus = computed(() => {
    if (!isReady.value) return false;
    return permissions.value?.Auth_Status === 0;
  });

  const canRecordStatus = computed(() => {
    if (!isReady.value) return false;
    return permissions.value?.Record_Status === 'O';
  });

  // Generic permission checker
  const hasPermission = (permissionKey: keyof RolePermissions): boolean => {
    if (!isReady.value) return false;
    return permissions.value?.[permissionKey] === 1;
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = (permissionKeys: (keyof RolePermissions)[]): boolean => {
    if (!isReady.value) return false;
    return permissionKeys.some(key => hasPermission(key));
  };

  // Check if user has all of the specified permissions
  const hasAllPermissions = (permissionKeys: (keyof RolePermissions)[]): boolean => {
    if (!isReady.value) return false;
    return permissionKeys.every(key => hasPermission(key));
  };

  // Wait for permissions to be ready (useful for async operations)
  const waitForReady = async (timeout = 10000): Promise<boolean> => {
    if (isReady.value) return true;

    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const unwatch = watch(isReady, (ready) => {
        if (ready) {
          unwatch();
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          unwatch();
          console.error('Permission loading timeout');
          resolve(false);
        }
      }, { immediate: true });
    });
  };

  // Debug helper
  const debugPermissions = () => {
    console.log('=== Permission Debug Info ===');
    console.log('Is Initialized:', isInitialized.value);
    console.log('Is Loading:', isLoading.value);
    console.log('Is Ready:', isReady.value);
    console.log('Initialization Error:', initializationError.value);
    console.log('Role Store Error:', roleStore.filter_role_id.error);
    console.log('Sub Menu ID:', roleStore.filter_role_id.query.sub_menu_id);
    console.log('Role ID:', roleStore.filter_role_id.query.role_id);
    console.log('Permissions Object:', permissions.value);
    console.log('Permission Values:', {
      canView: canView.value,
      canAdd: canAdd.value,
      canEdit: canEdit.value,
      canDelete: canDelete.value,
      canAuthorize: canAuthorize.value
    });
    console.log('===========================');
  };

  return {
    // Core
    roleStore,
    roleData,
    permissions,
    
    // Initialization
    initializeRole,
    isInitialized,
    isLoading,
    isReady,
    initializationError,
    waitForReady,
    
    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Specific permissions
    canView,
    canEdit,
    canDelete,
    canAuthorize,
    canAdd,
    canAuthStatus,
    canRecordStatus,
    
    // Debug
    debugPermissions
  };
};