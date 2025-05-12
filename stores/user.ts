import { UserModel } from "@/models";
import axios from "@/helpers/axios";
import { CallSwal } from "~/composables/global"; // ຮັບປະກັນວ່າມີການ import CallSwal

export const UserStore = defineStore("user", {
  state() {
    return {
      create_user_form: {
        User_Id: "",
        User_Name: "",
        User_Email: "",
        User_Mobile: "",
        User_Password: "",
        Div_Id: "",
        User_Status: true, 
        Maker_Id: "",
        Auth_Status: "",
        profile_image: "",
        Role_ID: "",
      },
      userList: [] as UserModel.Items[], 
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
            console.log("User List assigned:", this.userList);
          } else {
            console.log(
              "Expected data.Item structure not found, examining response:"
            );

            if (Array.isArray(response.data)) {
              console.log("Data is an array directly");
              this.userList = response.data;
            } else if (
              response.data.items &&
              Array.isArray(response.data.items)
            ) {
              console.log("Found data.items (lowercase)");
              this.userList = response.data.items;
            } else if (typeof response.data === "object") {
              console.log("Searching for first array property in data");
              for (const key in response.data) {
                if (Array.isArray(response.data[key])) {
                  console.log(`Found array at data.${key}`);
                  this.userList = response.data[key];
                  break;
                }
              }
            }
          }
          console.log("Final userList state:", this.userList);
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
       
        if (!this.create_user_form.User_Name || !this.create_user_form.User_Email) {
          await CallSwal({
            title: "ຜິດພາດ",
            text: "ກະລຸນາປ້ອນຂໍ້ມູນທີ່ຈຳເປັນ",
            icon: "error",
            showConfirmButton: false,
            timer: 1500,
          });
          return;
        }

        const req = await axios.post(`/api/users/`, this.create_user_form, {
          headers: {
            "Content-Type": "application/json",
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

          
          this.resetCreateForm();
          
          
          await this.GetUser();
          
          return req.data; 
        }
      } catch (error: any) {
        console.error("Error creating user:", error);
        
        
        await CallSwal({
          title: "ຜິດພາດ",
          text: error.response?.data?.message || "ເກີດຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນຜູ້ໃຊ້",
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
        User_Id: "",
        User_Name: "",
        User_Email: "",
        User_Mobile: "",
        User_Password: "",
        Div_Id: "",
        User_Status: true,
        Maker_Id: "",
        Auth_Status: "",
        Role_ID: "",
        profile_image: "",
      };
    },

    
    
  },
});