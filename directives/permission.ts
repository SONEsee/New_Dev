import type { App, DirectiveBinding } from "vue";
import { RoleStore } from "@/stores/role";

interface PermissionBinding {
  permission: string;
  mode?: "hide" | "disable";
}

const checkPermission = (binding: DirectiveBinding): boolean => {
  const roleStore = RoleStore();
  const permissions = roleStore.responst_data_detail?.[0];

  if (!permissions) return false;

  const value = binding.value;

  if (typeof value === "string") {
    return permissions[value] === 1;
  }

  if (typeof value === "object" && value.permission) {
    return permissions[value.permission] === 1;
  }

  return false;
};

export const permissionDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const hasPermission = checkPermission(binding);
    const mode = binding.value?.mode || "hide";

    if (!hasPermission) {
      if (mode === "hide") {
        el.style.display = "none";
      } else if (mode === "disable") {
        el.style.opacity = "0.5";
        el.style.pointerEvents = "none";
        if (el.tagName === "BUTTON" || el.tagName === "INPUT") {
          (el as HTMLButtonElement | HTMLInputElement).disabled = true;
        }
      }
    }
  },

  updated(el: HTMLElement, binding: DirectiveBinding) {
    const hasPermission = checkPermission(binding);
    const mode = binding.value?.mode || "hide";

    if (hasPermission) {
      el.style.display = "";
      el.style.opacity = "";
      el.style.pointerEvents = "";
      if (el.tagName === "BUTTON" || el.tagName === "INPUT") {
        (el as HTMLButtonElement | HTMLInputElement).disabled = false;
      }
    } else {
      if (mode === "hide") {
        el.style.display = "none";
      } else if (mode === "disable") {
        el.style.opacity = "0.5";
        el.style.pointerEvents = "none";
        if (el.tagName === "BUTTON" || el.tagName === "INPUT") {
          (el as HTMLButtonElement | HTMLInputElement).disabled = true;
        }
      }
    }
  },
};

export const registerPermissionDirective = (app: App) => {
  app.directive("permission", permissionDirective);
};
