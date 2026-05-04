import axios from "axios";

const PHP_BASE_URL =
  import.meta.env.VITE_LOGIN_ENDPOINT || "https://namami-infotech.com/MMSalary";

export const officeService = {
  async getoffice({ token }) {
    try {
      const response = await axios.get(
        `${PHP_BASE_URL}/office_admin/get_offices.php`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // console.log("namaisuccessfully:", response.data);
      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data ?? [],
        allData: response.data.allData ?? [],
      };
    } catch (error) {
      console.error("Error fetching offices:", error);

      return {
        success: false,
        message:
          error.response?.data?.message || error.message || "Request failed",
      };
    }
  },

  async updateOfficeStatus(officeId, isActive, token) {
    try {
      const endpoint = `${PHP_BASE_URL}/office_admin/update_office_status.php`;

      const payload = {
        id: officeId,
        active_status: isActive ? 1 : 0,
      };

      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const jsonData =
        typeof response.data === "string"
          ? JSON.parse(response.data)
          : response.data;

      return (
        jsonData || { status: true, message: "Status updated successfully" }
      );
    } catch (error) {
      console.error("Error updating office status:", error);
      const errorData =
        typeof error.response?.data === "string"
          ? JSON.parse(error.response.data)
          : error.response?.data;

      throw (
        errorData || {
          status: false,
          message: "Failed to update office status",
        }
      );
    }
  },

  async createOffice(payload, token) {
    try {
      // console.log("Creating office:", payload);

      const endpoint = `${PHP_BASE_URL}/office_admin/add_offices.php`;

      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      // console.log("API RESPONSE:", response.data);

      return response.data;
    } catch (error) {
      console.error("ERROR:", error.response?.data || error.message);

      throw (
        error.response?.data || {
          status: false,
          message: "Failed to create office",
        }
      );
    }
  },
  async updateOffice(payload, token) {
    try {
      // console.log("Updating office with payload:", payload);
      const endpoint = `${PHP_BASE_URL}/office_admin/update_office.php`;
      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      const jsonData =
        typeof response.data === "string"
          ? JSON.parse(response.data)
          : response.data;

      return (
        jsonData || { status: true, message: "Office updated successfully" }
      );
    } catch (error) {
      console.error("Error updating office:", error);
      const errorData =
        typeof error.response?.data === "string"
          ? JSON.parse(error.response.data)
          : error.response?.data;

      throw (
        errorData || {
          status: false,
          message: "Failed to update office",
        }
      );
    }
  },
};
