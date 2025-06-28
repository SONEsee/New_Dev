import axios from "@/helpers/axios";
import { LocationModel } from "~/models";
import { CallSwal, goPath } from "#build/imports";
export const locationStore = defineStore("location", {
  state() {
    return {
      response_location_data: null as LocationModel.Location | null,
      response_location_list: null as LocationModel.Location[] | null,
      response_location_detail: null as LocationModel.Location | null,
      response_parent_locations: null as LocationModel.Location[] | null,
      isLoading: false,
      form_create_location: {
        location_code: "",
        location_name_la: "",
        location_name_en: "",
        parent_location_id: null as number | null,
        location_type: "" ,
        address: "",
        responsible_person: "",
        phone: "",
        remarks: "",
        record_stat: "O" as 'C' | 'O',
      },
      form_update_location: {
       
        location_code: "",
        location_name_la: "",
        location_name_en: "",
        parent_location_id: null as number | null,
        location_type: "" ,
        address: "",
        responsible_person: "",
        phone: "",
        remarks: "",
       
      },
    };
  },
  actions: {
    
    async GetLocationList() {
      this.isLoading = true;
      try {
        const res = await axios.get<LocationModel.Location[]>(
          `/api/asset_location/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_location_list = res.data;
        }
      } catch (error) {
        console.error("Error fetching location list:", error);
      } finally {
        this.isLoading = false;
      }
    },

  
    async GetParentLocations() {
      this.isLoading = true;
      try {
        const res = await axios.get<LocationModel.Location[]>(
          `/api/asset_location/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_parent_locations = res.data;
        }
      } catch (error) {
        console.error("Error fetching parent locations:", error);
      } finally {
        this.isLoading = false;
      }
    },

  
    async GetLocationDetail(id:number) {
      this.isLoading = true;
      try {
        const res = await axios.get<LocationModel.Location>(
          `/api/asset_location/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          this.response_location_detail = res.data;
        }
      } catch (error) {
        console.error("Error fetching location detail:", error);
      } finally {
        this.isLoading = false;
      }
    },

  
    async CreateLocation() {
      this.isLoading = true;
      try {
        const res = await axios.post<LocationModel.Location>(
          `/api/asset_location/`,
          this.form_create_location,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200 || res.status === 201) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການເພີ່ມສະຖານທີ່",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            goPath("/property/locations/");
          }, 1500);

     
          this.resetCreateForm();
        }
      } catch (error) {
        console.error("Error creating location:", error);
        CallSwal({
          title: "ຜິດພາດ",
          text: "ມີຂໍ້ຜິດພາດໃນການເພີ່ມຂໍ້ມູນ",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "ຕົກລົງ",
        });
      } finally {
        this.isLoading = false;
      }
    },

  
    async UpdateLocation(id: number) {
      this.isLoading = true;
      try {
        const res = await axios.put<LocationModel.Location>(
          `/api/asset_location/${id}/`,
          this.form_update_location,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການແກ້ໄຂສະຖານທີ່",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
          setTimeout(() => {
            goPath("/property/locations/");
          }, 1500);

        
          this.resetUpdateForm();
        }
      } catch (error) {
        console.error("Error updating location:", error);
        CallSwal({
          title: "ຜິດພາດ",
          text: "ມີຂໍ້ຜິດພາດໃນການແກ້ໄຂຂໍ້ມູນ",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "ຕົກລົງ",
        });
      } finally {
        this.isLoading = false;
      }
    },

 
    async DeleteLocation(id: string) {
      this.isLoading = true;
      try {
        const res = await axios.delete(`/api/asset_location/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.status === 200 || res.status === 204) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການລຶບສະຖານທີ່",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
            timer: 1500,
          });
        
          await this.GetLocationList();
        }
      } catch (error) {
        console.error("Error deleting location:", error);
        CallSwal({
          title: "ຜິດພາດ",
          text: "ມີຂໍ້ຜິດພາດໃນການລຶບຂໍ້ມູນ",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "ຕົກລົງ",
        });
      } finally {
        this.isLoading = false;
      }
    },

  
    async UpdateLocationStatus(id: number, ) {
      this.isLoading = true;
      try {
        const res = await axios.post(
          `api/asset_location/${id}/set_open/`,
          
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການອັບເດດສະຖານະ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
    
          await this.GetLocationList();
        }
      } catch (error) {
        console.error("Error updating location status:", error);
        CallSwal({
          title: "ຜິດພາດ",
          text: "ມີຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະ",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "ຕົກລົງ",
        });
      } finally {
        this.isLoading = false;
      }
    },
    async UpdateLocationStatusof(id: number, ) {
      this.isLoading = true;
      try {
        const res = await axios.post(
          `api/asset_location/${id}/set_close/`,
         
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (res.status === 200) {
          CallSwal({
            title: "ສຳເລັດ",
            text: "ສຳເລັດການອັບເດດສະຖານະ",
            icon: "success",
            showCancelButton: false,
            showConfirmButton: false,
          });
    
          await this.GetLocationList();
        }
      } catch (error) {
        console.error("Error updating location status:", error);
        CallSwal({
          title: "ຜິດພາດ",
          text: "ມີຂໍ້ຜິດພາດໃນການອັບເດດສະຖານະ",
          icon: "error",
          showCancelButton: false,
          confirmButtonText: "ຕົກລົງ",
        });
      } finally {
        this.isLoading = false;
      }
    },

   
    resetCreateForm() {
      this.form_create_location = {
        location_code: "",
        location_name_la: "",
        location_name_en: "",
        parent_location_id: null,
        location_type: "",
        address: "",
        responsible_person: "",
        phone: "",
        remarks: "",
        record_stat: "O",
      };
    },

  
    resetUpdateForm() {
      this.form_update_location = {
       
        location_code: "",
        location_name_la: "",
        location_name_en: "",
        parent_location_id: null,
        location_type: "",
        address: "",
        responsible_person: "",
        phone: "",
        remarks: "",
       
      };
    },
  },

  getters: {
  
    locationsByType: (state) => {
      if (!state.response_location_list) return {};
      
      return state.response_location_list.reduce((acc, location) => {
        if (!acc[location.location_type]) {
          acc[location.location_type] = [];
        }
        acc[location.location_type].push(location);
        return acc;
      }, {} as Record<string, LocationModel.Location[]>);
    },

   
    locationsByStatus: (state) => {
      if (!state.response_location_list) return {};
      
      return state.response_location_list.reduce((acc, location) => {
        if (!acc[location.record_stat]) {
          acc[location.record_stat] = [];
        }
        acc[location.record_stat].push(location);
        return acc;
      }, {} as Record<string, LocationModel.Location[]>);
    },

    
    mainLocations: (state) => {
      if (!state.response_location_list) return [];
      return state.response_location_list.filter(
        (location) => !location.parent_location_id
      );
    },

   
    subLocations: (state) => {
      if (!state.response_location_list) return [];
      return state.response_location_list.filter(
        (location) => location.parent_location_id
      );
    },

    
    activeLocations: (state) => {
      if (!state.response_location_list) return [];
      return state.response_location_list.filter(location => location.record_stat === 'O');
    },


    locationsByParent: (state) => {
      if (!state.response_location_list) return {};
      
      return state.response_location_list.reduce((acc, location) => {
        const parentId = location.parent_location_id || 'root';
        if (!acc[parentId]) {
          acc[parentId] = [];
        }
        acc[parentId].push(location);
        return acc;
      }, {} as Record<string | number, LocationModel.Location[]>);
    },

 
    locationHierarchy: (state) => {
      if (!state.response_location_list) return [];
      
      const buildTree = (parentId: number | null = null): any[] => {
        return state.response_location_list!
          .filter(location => location.parent_location_id === parentId)
          .map(location => ({
            ...location,
            children: buildTree(location.location_id)
          }));
      };
      
      return buildTree();
    },

   
    countByType: (state) => {
      if (!state.response_location_list) return {};
      
      return state.response_location_list.reduce((acc, location) => {
        acc[location.location_type] = (acc[location.location_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    },

    buildingsOnly: (state) => {
      if (!state.response_location_list) return [];
      return state.response_location_list.filter(location => location.location_type === 'BUILDING');
    },

   
    warehousesOnly: (state) => {
      if (!state.response_location_list) return [];
      return state.response_location_list.filter(location => location.location_type === 'WAREHOUSE');
    },
  },
});