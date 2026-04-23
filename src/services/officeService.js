import axios from "axios";

const PHP_BASE_URL =
  import.meta.env.VITE_LOGIN_ENDPOINT ||
  "https://namami-infotech.com/MMSalary";

export const officeService = {
  async getoffice({ token, payload = {} }) {
    try {
      const response = await axios.get(
        `${PHP_BASE_URL}/office_admin/get_offices.php`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: payload,
        }
      );

      return {
        success: true,
        data: response.data,
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
};