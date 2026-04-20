import axios from "axios";
import { fakeApi } from "../api/fakeApi";

const PHP_BASE_URL =
  import.meta.env.VITE_PHP_BASE_URL || "https://namami-infotech.com/MMSalary";

const axiosInstance = axios.create({
  baseURL: PHP_BASE_URL,
  timeout: 10000,
  withCredentials: false,
});

export const attendanceService = {
  /**
   * Fetch attendance for a single office ID
   */
  async fetchAttendanceForOffice(officeid, date, token) {
    const url = `/attandance/get_attandance_byofficeid.php?officeid=${officeid.trim()}&date=${date}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await axiosInstance.get(url, config);
    return response.data?.data ?? [];
  },

  /**
   * Fetch attendance for today (default)
   */
  async getAttendanceToday({ token, user }) {
    try {
      if (!user?.officeid) {
        const fallback = await fakeApi.getAttendance();
        return { data: fallback.data };
      }

      const today = new Date().toISOString().split("T")[0];

      // Handle multiple office IDs (comma-separated)
      const officeIds = user.officeid
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

      // Make parallel requests for all office IDs
      const promises = officeIds.map((id) =>
        this.fetchAttendanceForOffice(id, today, token),
      );

      const results = await Promise.all(promises);
      const mergedData = results.flat();

      return {
        data: mergedData,
      };
    } catch (error) {
      return {
        data: [],
        error: error.message,
      };
    }
  },

  /**
   * Fetch attendance for a specific date
   */
  async getAttendanceByDate({ token, user, date }) {
    try {
      if (!user?.officeid) {
        const fallback = await fakeApi.getAttendance();
        return { data: fallback.data };
      }

      const formattedDate = date || new Date().toISOString().split("T")[0];

      // Handle multiple office IDs (comma-separated)
      const officeIds = user.officeid
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

      // Make parallel requests for all office IDs
      const promises = officeIds.map((id) =>
        this.fetchAttendanceForOffice(id, formattedDate, token),
      );

      const results = await Promise.all(promises);
      const mergedData = results.flat();

      return {
        data: mergedData,
      };
    } catch (error) {
      return {
        data: [],
        error: error.message,
      };
    }
  },
};
