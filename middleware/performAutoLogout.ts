function performAutoLogout(forced = false): void {
  if (window.autoLogoutManager) {
    window.autoLogoutManager.stop();
  }

  localStorage.removeItem("token");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");

  Object.keys(localStorage).forEach((key: string) => {
    if (key.includes('filter')) {
      localStorage.removeItem(key);
    }
  });

  CallSwal({
    title: "ຄຳເຕືອນ",
    text: forced
      ? "ທ່ານຖືກລົງຊື່ອອກໂດຍຜູ້ດູແລລະບົບ"
      : "ທ່ານຖືກ logout ເນື່ອງຈາກບໍ່ມີການເຄື່ອນໄຫວໃນ 15 ນາທີ",
    icon: "warning",
    confirmButtonText: "ຕົກລົງ",
    timer: 5000,
  });

  window.location.href = "/login";
}
