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
