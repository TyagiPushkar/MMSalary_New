import axios from "axios";

const PHP_BASE_URL =
  import.meta.env.VITE_LOGIN_ENDPOINT || "https://namami-infotech.com/MMSalary";

export const roleService = {
  // Fetch All Roles
  fetchRoles: async (token) => {
    try {
      const response = await axios.get(
        `${PHP_BASE_URL}/Rolefetch/get_role.php`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  },
};
export default roleService;
