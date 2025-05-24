import { UserModel } from "@/models";
import axios from "@/helpers/axios";
import { CallSwal } from "~/composables/global";

export const UserStore = defineStore("user", {
  state() {
    return {
      create_user_form: {
        user_id: "",
        user_name: "",
        user_email: "",
        user_mobile: "",
        user_password: "",
        Div_Id: "",
        user_status: true,
        Maker_Id: "",
        muth_status: "",
        profile_image: null,
        Role_ID: "",
        Auth_Status: "",
        pwd_changed_on: "",
      },
      update_user_form:
      {
        user_id: "",
        user_name: "",
        user_email: "",
        user_mobile: "",
        user_password: "",
        Div_Id: "",
        user_status: true,
        Maker_Id: "",
        muth_status: "",
        profile_image: null,
        Role_ID: "",
        Auth_Status: "",
        pwd_changed_on: "",
      },
      userList: [] as UserModel.Items[],
      request_userid_detail:{
        user_id: null as string | null,
      },
      respone_data_detail: null as UserModel.Items | null,
      loading: false,
    };
  },
  actions: {
    async GetUser() {
      this.loading = true;
      try {
        const response = await axios.get(`/api/users/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.status === 200) {
          if (
            response.data &&
            response.data.Item &&
            Array.isArray(response.data.Item)
          ) {
            this.userList = response.data.Item;
          } else {
            if (Array.isArray(response.data)) {
              this.userList = response.data;
            } else if (
              response.data.items &&
              Array.isArray(response.data.items)
            ) {
              this.userList = response.data.items;
            } else if (typeof response.data === "object") {
              for (const key in response.data) {
                if (Array.isArray(response.data[key])) {
                  this.userList = response.data[key];
                  break;
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        this.userList = [];
      } finally {
        this.loading = false;
      }
    },

    async CreatUser() {
      this.loading = true;
      try {
        if (
          !this.create_user_form.user_id ||
          !this.create_user_form.user_name ||
          !this.create_user_form.user_mobile ||
          !this.create_user_form.user_password ||
          !this.create_user_form.Div_Id ||
          !this.create_user_form.Role_ID ||
          !this.create_user_form.Auth_Status
        ) {
          await CallSwal({
            title: "ຜິດພາດ",
            text: "ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນ",
            icon: "error",
            showConfirmButton: false,
            timer: 1500,
          });
          return;
        }

        const formData = new FormData();

        formData.append("user_id", this.create_user_form.user_id);
        formData.append("user_name", this.create_user_form.user_name);
        formData.append("user_email", this.create_user_form.user_email || "");
        formData.append("user_mobile", this.create_user_form.user_mobile);
        formData.append("user_password", this.create_user_form.user_password);
        formData.append("Div_Id", this.create_user_form.Div_Id);
        formData.append("Role_ID", this.create_user_form.Role_ID);

        let authStatus = this.create_user_form.Auth_Status;
        if (authStatus === "ເປີດ") {
          authStatus = "A";
        } else if (authStatus === "ປິດ") {
          authStatus = "I";
        }
        formData.append("Auth_Status", authStatus);

        formData.append("user_status", authStatus === "A" ? "true" : "false");

        if (this.create_user_form.profile_image) {
          formData.append("profile_image", this.create_user_form.profile_image);
        }

        
        const req = await axios.post(`/api/users/`, formData, {
          headers: {
            
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (req.status === 200 || req.status === 201) {
          await CallSwal({
            title: "ສຳເລັດ",
            text: "ເພີ່ມຂໍ້ມູນຜູ້ໃຊ້ສຳເລັດ",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
goPath("/user");
          this.resetCreateForm();
          await this.GetUser();
          return req.data;
          
        }
      } catch (error: any) {
        console.error("Error creating user:", error);
        console.log("Server response:", error.response?.data);

        let errorMessage = "ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນຜູ້ໃຊ້";

        if (error.response?.data) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.user_id) {
            errorMessage = `ຂໍ້ຜິດພາດທີ່ user_id: ${error.response.data.user_id}`;
          } else if (typeof error.response.data === "object") {
            const firstErrorKey = Object.keys(error.response.data)[0];
            if (firstErrorKey) {
              errorMessage = `${firstErrorKey}: ${error.response.data[firstErrorKey]}`;
            }
          }
        }

        await CallSwal({
          title: "ຜິດພາດ",
          text: errorMessage,
          icon: "error",
          showConfirmButton: false,
          timer: 1500,
        });

        return null;
      } finally {
        this.loading = false;
      }
    },
    

    resetCreateForm() {
      this.create_user_form = {
        user_id: "",
        user_name: "",
        user_email: "",
        user_mobile: "",
        user_password: "",
        Div_Id: "",
        user_status: true,
        Maker_Id: "",
        Auth_Status: "",
        Role_ID: "",
        profile_image: null,
        muth_status: "",
        pwd_changed_on: "",
      };
    },
  async GetdatadetailUser(user_id: string) {
 
  try {
    
    const res = await axios.get<UserModel.Items>(`api/users/${user_id}`, {

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (res.status === 200) {
      this.respone_data_detail = res.data ;
    }
  } catch (error) {
    console.error("Error fetching user details:", error);
  }
},
async UpdateUser(user_id: string) {
  this.loading = true;
  try {
    const formData = new FormData();  
    formData.append("user_id", this.update_user_form.user_id);
    formData.append("user_name", this.update_user_form.user_name);
    formData.append("user_email", this.update_user_form.user_email || "");
    formData.append("user_mobile", this.update_user_form.user_mobile);
    
   
    if (this.update_user_form.user_password && this.update_user_form.user_password.trim() !== '') {
      formData.append("user_password", this.update_user_form.user_password);
    }
    
    formData.append("Div_Id", this.update_user_form.Div_Id);
    formData.append("Role_ID", this.update_user_form.Role_ID);
    
    let authStatus = this.update_user_form.Auth_Status;
    if (authStatus === "ເປີດ") {
      authStatus = "A";
    } else if (authStatus === "ປິດ") {
      authStatus = "I";
    }
    formData.append("Auth_Status", authStatus);
    formData.append("user_status", authStatus === "A" ? "true" : "false");
    
    if (this.update_user_form.profile_image) {
      formData.append("profile_image", this.update_user_form.profile_image);
    }
    
    const req = await axios.put(`/api/users/${user_id}`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    
    if (req.status === 200 || req.status === 204) {
      await CallSwal({
        title: "ສຳເລັດ",
        text: "ແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້ສຳເລັດ",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });
      goPath("/user");
      await this.GetUser();
      return req.data;
    }
  } catch (error: any) {
    console.error("Error updating user:", error);
    
    let errorMessage = "ເກີດຂໍ້ຜິດພາດໃນການແກ້ໄຂຂໍ້ມູນຜູ້ໃຊ້";
    if (error.response?.data) {
      if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response.data === "object") {
        const firstErrorKey = Object.keys(error.response.data)[0];
        if (firstErrorKey) {
          errorMessage = `${firstErrorKey}: ${error.response.data[firstErrorKey]}`;
        }
      }
    }
    
    await CallSwal({
      title: "ຜິດພາດ",
      text: errorMessage,
      icon: "error",
      showConfirmButton: false,
      timer: 1500,
    });
    
    return null;
  } finally {
    this.loading = false;
  }
},
async DeleteUser(user_id: string) {
  this.loading = true;
  try {
   
    if (!user_id) {
     
      return null;
    }

    //
    const response = await axios.delete(`/api/users/${user_id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    
    if (response.status === 204 || response.status === 200 || response.status === 301) {
      await CallSwal({
        title: "ສຳເລັດ",
        text: "ລຶບຂໍ້ມູນຜູ້ໃຊ້ສຳເລັດ",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });
      return response.data;
    } else {
      await CallSwal({
        title: "ສຳເລັດ",
        text: "ລຶບຂໍ້ມູນຜູ້ໃຊ້ສຳເລັດ",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
        
      });
      goPath("/user");
    }
  } catch (error: any) {
    console.error("Error deleting user:", error);
    
  
    let errorMessage = "ເກີດຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນ";
    
    if (error.response) {
    
      if (error.response.status === 404) {
        errorMessage = "ບໍ່ພົບຂໍ້ມູນຜູ້ໃຊ້";
      } else if (error.response.status === 403) {
        errorMessage = "ທ່ານບໍ່ມີສິດໃນການລຶບຂໍ້ມູນນີ້";
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    await CallSwal({
      title: "ຜິດພາດ",
      text: errorMessage,
      icon: "error",
      showConfirmButton: false,
      timer: 1500,
    });
    return null;
  } finally {
    this.loading = false;
  }
}

  },
});
