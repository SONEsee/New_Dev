import { computed, ref, watch } from "vue";

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

  
  const isInitialized = ref(false);
  const initializationError = ref<string | null>(null);

  const initializeRole = async (subMenuId?: string, forceReload = false) => {
    try {
      initializationError.value = null;

      if (subMenuId) {
        roleStore.setSubMenuId(subMenuId);
      }

      if (!roleStore.filter_role_id.query.sub_menu_id) {
        const error = "Sub Menu ID is required for permission check";
        console.error(error);
        initializationError.value = error;
        return false;
      }

      console.log("Initializing role permissions with:", {
        role_id: roleStore.filter_role_id.query.role_id,
        sub_menu_id: roleStore.filter_role_id.query.sub_menu_id,
        forceReload,
      });

      
      await roleStore.GetRoleDetail(forceReload);

      // Check if load was successful
      if (roleStore.filter_role_id.error) {
        initializationError.value = roleStore.filter_role_id.error;
        return false;
      }

      isInitialized.value = true;
      console.log("Role permissions initialized successfully");
      return true;
    } catch (error: any) {
      console.error("Error initializing role permissions:", error);
      initializationError.value =
        error.message || "Failed to initialize permissions";
      isInitialized.value = false;
      return false;
    }
  };

  const roleData = computed(() => {
    return roleStore.responst_data_detail;
  });

  const permissions = computed((): RolePermissions | null => {
    const data = roleData.value;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return null;
    }

    return data[0] || null;
  });

  const isLoading = computed(() => {
    return roleStore.isloading || roleStore.filter_role_id.isloading;
  });

  const isReady = computed(() => {
    return (
      roleStore.isPermissionsReady &&
      isInitialized.value &&
      !initializationError.value
    );
  });

  const canView = computed(() => {
    if (!isReady.value) {
      console.warn("Permissions not ready, canView returning false");
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
    return permissions.value?.Record_Status === "O";
  });

  
  const hasPermission = (permissionKey: keyof RolePermissions): boolean => {
    if (!isReady.value) return false;
    return permissions.value?.[permissionKey] === 1;
  };


  const hasAnyPermission = (
    permissionKeys: (keyof RolePermissions)[]
  ): boolean => {
    if (!isReady.value) return false;
    return permissionKeys.some((key) => hasPermission(key));
  };

 
  const hasAllPermissions = (
    permissionKeys: (keyof RolePermissions)[]
  ): boolean => {
    if (!isReady.value) return false;
    return permissionKeys.every((key) => hasPermission(key));
  };

  
  const waitForReady = async (timeout = 100): Promise<boolean> => {
    if (isReady.value) return true;

    return new Promise((resolve) => {
      const startTime = Date.now();

      const unwatch = watch(
        isReady,
        (ready) => {
          if (ready) {
            unwatch();
            resolve(true);
          } else if (Date.now() - startTime > timeout) {
            unwatch();
            console.error("Permission loading timeout");
            resolve(false);
          }
        },
        { immediate: true }
      );
    });
  };

  return {
  
    roleStore,
    roleData,
    permissions,

    initializeRole,
    isInitialized,
    isLoading,
    isReady,
    initializationError,
    waitForReady,

    hasPermission,
    hasAnyPermission,
    hasAllPermissions,

    canView,
    canEdit,
    canDelete,
    canAuthorize,
    canAdd,
    canAuthStatus,
    canRecordStatus,
  };
};
