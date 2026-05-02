import axios from "axios";
import { USER_TYPES } from "../constants/roles";

const PHP_BASE_URL =
  import.meta.env.VITE_PHP_BASE_URL || "https://namami-infotech.com/MMSalary";

const axiosInstance = axios.create({
  baseURL: PHP_BASE_URL,
  timeout: 10000,
  withCredentials: false,
});

export const attendanceService = {
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
    //console.log("Attendance data for office", officeid, ":", response.data);
    return response.data?.data ?? [];
  },

  async fetchAllEmployeesAttendance(date, token) {
    const url = `/attandance/get_all_employee_attandance.php?date=${date}`;

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

  async getAttendanceByDate({ token, user, date }) {
    try {
      const formattedDate = date || new Date().toISOString().split("T")[0];

      if (user?.type === USER_TYPES.SUPER) {
        const data = await this.fetchAllEmployeesAttendance(
          formattedDate,
          token,
        );
        return { data };
      }

      if (!user?.officeid) {
        return { data: [] };
      }

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
      console.log("Merged attendance data:", mergedData);
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

  // async getAttendanceToday({ token, user }) {
  //   try {
  //     if (!user?.officeid) {
  //       const fallback = await fakeApi.getAttendance();
  //       return { data: fallback.data };
  //     }

  //     const today = new Date().toISOString().split("T")[0];

  //     // Handle multiple office IDs (comma-separated)
  //     const officeIds = user.officeid
  //       .split(",")
  //       .map((id) => id.trim())
  //       .filter((id) => id.length > 0);

  //     // Make parallel requests for all office IDs
  //     const promises = officeIds.map((id) =>
  //       this.fetchAttendanceForOffice(id, today, token),
  //     );

  //     const results = await Promise.all(promises);
  //     const mergedData = results.flat();

  //     return {
  //       data: mergedData,
  //     };
  //   } catch (error) {
  //     return {
  //       data: [],
  //       error: error.message,
  //     };
  //   }
  // },
};
