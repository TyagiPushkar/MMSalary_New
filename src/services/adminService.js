import axios from "axios";

const PHP_BASE_URL =
  import.meta.env.VITE_PHP_BASE_URL || "https://namami-infotech.com/MMSalary";

export const adminService = {
  async getAllAdmins({ token, user }) {
    if (!token || !user) {
      return { data: [] };
    }
    try {
      const endpoint = `${PHP_BASE_URL}/Admin/get_all_admin.php`;

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      // Parse JSON response safely
      const jsonData =
        typeof response.data === "string"
          ? JSON.parse(response.data)
          : response.data;

      const adminsList = Array.isArray(jsonData?.data)
        ? jsonData.data
        : Array.isArray(jsonData)
          ? jsonData
          : [];

      return { data: adminsList };
    } catch (error) {
      console.error("Error fetching admins:", error);
      return { data: [] };
    }
  },

  async updateAdminStatus(adminId, isActive, token) {
    try {
      const endpoint = `${PHP_BASE_URL}/Admin/update_admin_status.php`;

      // Send data in the format API expects: { adminid: string, active_status: number }
      const payload = {
        email: adminId,
        active_status: isActive ? 1 : 0,
      };

      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      // Parse JSON response safely
      const jsonData =
        typeof response.data === "string"
          ? JSON.parse(response.data)
          : response.data;

      return (
        jsonData || { status: true, message: "Status updated successfully" }
      );
    } catch (error) {
      console.error("Error updating admin status:", error);
      const errorData =
        typeof error.response?.data === "string"
          ? JSON.parse(error.response.data)
          : error.response?.data;

      throw (
        errorData || { status: false, message: "Failed to update admin status" }
      );
    }
  },

  async updateAdminDetails(adminData, token) {
    try {
      const endpoint = `${PHP_BASE_URL}/Admin/update_admin_details.php`;

      const response = await axios.post(endpoint, adminData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      // Parse JSON response safely
      const jsonData =
        typeof response.data === "string"
          ? JSON.parse(response.data)
          : response.data;

      return jsonData || { status: 200, success: true };
    } catch (error) {
      console.error("Error updating admin details:", error);
      const errorData =
        typeof error.response?.data === "string"
          ? JSON.parse(error.response.data)
          : error.response?.data;

      throw errorData || { message: "Failed to update admin details" };
    }
  },
};
