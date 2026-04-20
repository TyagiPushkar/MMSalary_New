import axios from "axios";

const PHP_BASE_URL =
  import.meta.env.VITE_PHP_BASE_URL || "https://namami-infotech.com/MMSalary";

export const dataService = {
  /**
   * Get salary data
   * @param {string} token - Authorization token
   * @returns {Promise} - { data: [...salary records] }
   */
  async getSalary(token) {
    try {
      const response = await axios.get(`${PHP_BASE_URL}/get_salary.php`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { data: response.data?.data ?? [] };
    } catch (error) {
      console.error("Error fetching salary:", error);
      return { data: [] };
    }
  },

  /**
   * Get reports data
   * @param {string} token - Authorization token
   * @returns {Promise} - { data: [...reports] }
   */
  async getReports(token) {
    try {
      const response = await axios.get(`${PHP_BASE_URL}/get_reports.php`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { data: response.data?.data ?? [] };
    } catch (error) {
      console.error("Error fetching reports:", error);
      return { data: [] };
    }
  },

  /**
   * Get attendance data
   * @param {string} token - Authorization token
   * @returns {Promise} - { data: [...attendance records] }
   */
  async getAttendance(token) {
    try {
      const response = await axios.get(`${PHP_BASE_URL}/get_attendance.php`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { data: response.data?.data ?? [] };
    } catch (error) {
      console.error("Error fetching attendance:", error);
      return { data: [] };
    }
  },

  /**
   * Get all offices/roles from API
   * @param {string} token - Authorization token
   * @returns {Promise} - { data: [...offices] }
   */
  async getAllOffices(token) {
    try {
      const response = await axios.get(`${PHP_BASE_URL}/office_admin/get_offices.php`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === true && Array.isArray(response.data.data)) {
        return { data: response.data.data };
      }

      return { data: [] };
    } catch (error) {
      console.error("Error fetching offices:", error);
      return { data: [] };
    }
  },

  /**
   * Add salary for employee to multiple offices
   * @param {Object} payload - { employee_id, salary, offices: [...officeIds] }
   * @param {string} token - Authorization token
   * @returns {Promise} - API response
   */
  async addSalary(payload, token) {
    try {
      const response = await axios.post(
        `${PHP_BASE_URL}/add_salary.php`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Error adding salary:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },
};
