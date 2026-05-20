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
  async fetchAttendanceForOffice(officeid, { from, to }, token) {
    const cleanedOfficeId = officeid
      .split(",")
      .map((id) => id.trim())
      .join(",");

    const url = `/attandance/get_attandance_byofficeid.php?officeid=${cleanedOfficeId}&fromDate=${from}&toDate=${to}`;

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

  async fetchAllEmployeesAttendance({ from, to }, token) {
    const url = `/attandance/get_all_employee_attandance.php?fromDate=${from}&toDate=${to}`;
    // const url = `/attandance/test.php?fromDate=${from}&toDate=${to}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await axiosInstance.get(url, config);
    // console.log("All employees attendance data:", response.data);
    return response.data?.data ?? [];
  },

  async getAttendanceByDate({ token, user, from, to }) {
    try {
      const formattedFromDate = from || new Date().toISOString().split("T")[0];
      const formattedToDate = to || formattedFromDate; // Use the same date if 'to' is not provided
      // const

      if (user?.type === USER_TYPES.SUPER) {
        const data = await this.fetchAllEmployeesAttendance(
          { from: formattedFromDate, to: formattedToDate },
          token,
        );
        return { data };
      }

      if (!user?.officeid) {
        return { data: [] };
      }

      // Handle multiple office IDs (comma-separated)
      // console.log("User office ID(s):", user.officeid);
      // console.log("dates was that was passed", {
      //   from: formattedFromDate,
      //   to: formattedToDate,
      // });
      const response = await this.fetchAttendanceForOffice(
        user.officeid, // del,namami
        {
          from: formattedFromDate,
          to: formattedToDate,
        },
        token,
      );

      return {
        data: response ?? [],
      };
    } catch (error) {
      return {
        data: [],
        error: error.message,
      };
    }
  },
  async getAttendanceByOneDate({ token, user, date }) {
    try {
      const formattedFromDate = date || new Date().toISOString().split("T")[0];

      if (user?.type === USER_TYPES.SUPER) {
        const response = await axiosInstance.get(
          `/attandance/get_all_attandance.php?date=${formattedFromDate}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        return {
          data: response.data?.data ?? [],
        };
      }

      if (!user?.officeid) {
        return { data: [] };
      }

      // const officeIds = user.officeid
      //   .split(",")
      //   .map((id) => id.trim())
      //   .filter((id) => id.length > 0);

      // const promises = officeIds.map((id) =>
      //   this.fetchAttendanceForOffice(
      //     id,
      //     { from: formattedFromDate, to: formattedFromDate },
      //     token,
      //   ),
      // );

      // const results = await Promise.all(promises);

      // return {
      //   data: results.flat(),
      // };
      // SINGLE API CALL
      const response = await this.fetchAttendanceForOffice(
        user.officeid, // del,namami
        {
          from: formattedFromDate,
          to: formattedFromDate,
        },
        token,
      );

      return {
        data: response ?? [],
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
