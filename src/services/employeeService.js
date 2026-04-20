import axios from "axios";
import { fakeApi } from "../api/fakeApi";

const PHP_BASE_URL =
  import.meta.env.VITE_PHP_BASE_URL || "https://namami-infotech.com/MMSalary";
// Real endpoint reference: https://namami-infotech.com/MMSalary/Employee/add_employee.php
export const employeeService = {
  async getEmployees({ token, user }) {
    if (!token || !user) {
      const fallback = await fakeApi.getEmployees();
      return { data: fallback.data };
    }

    try {
      if (
        user.type !== "super" &&
        (user.officeid == null || user.officeid === "")
      ) {
        return { data: [] };
      }

      const endpoint =
        user.type === "super"
          ? `${PHP_BASE_URL}/Employee/get_all_employee.php`
          : `${PHP_BASE_URL}/Employee/fetch_employee_byofficeid.php?officeid=${encodeURIComponent(
              user.officeid,
            )}`;

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return { data: response.data?.data ?? [] };
    } catch {
      const fallback = await fakeApi.getEmployees();
      return { data: fallback.data };
    }
  },

  /** Request / registration queue: super vs office (Register API). */
  async getRequestEmployees({ token, user }) {
    if (!token || !user) {
      const fallback = await fakeApi.getEmployees();
      return { data: fallback.data };
    }

    try {
      if (
        user.type !== "super" &&
        (user.officeid == null || user.officeid === "")
      ) {
        return { data: [] };
      }

      const endpoint =
        user.type === "super"
          ? `${PHP_BASE_URL}/Employee/getall_req_employee.php`
          : `${PHP_BASE_URL}/Register/fetch_employee.php?officeid=${encodeURIComponent(
              user.officeid,
            )}`;

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return { data: response.data?.data ?? [] };
    } catch {
      const fallback = await fakeApi.getEmployees();
      return { data: fallback.data };
    }
  },

  async addRequestEmployees({ token, user, payload }) {
    if (!token || !user) {
      const fallback = await fakeApi.getEmployees();
      return { data: fallback.data };
    }
    try {
      if (
        user.type !== "super" &&
        (user.officeid == null || user.officeid === "")
      ) {
        return { data: [] };
      }
      // console.log("user in service:", user);
      // console.log("token in service:", token);
      // console.log("Adding employee with payload by api services:", payload);
      const endpoint =
        user.type === "super"
          ? `${PHP_BASE_URL}/Employee/mm_add_employee.php`
          : `${PHP_BASE_URL}/Employee/add_req_employe.php`;
      // const endpoint = `${PHP_BASE_URL}/Employee/add_req_employee.php`;
      const response = await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      // console.log("Response from add employee API:", response.data);
      return response.data;
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  },

  async updateEmployeeDetails(payload, token, user) {
    if (!token || !user) {
      const fallback = await fakeApi.getEmployees();
      return { data: fallback.data };
    }
    const response = await axios.post(
      `${PHP_BASE_URL}/update_employee_details.php`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  },

  async updateEmployeeStatus(employeeid, status, token) {
    if (!token) {
      throw new Error("Authorization token required");
    }

    const response = await axios.post(
      `${PHP_BASE_URL}/Employee/admin_update_status.php`,
      {
        employeeid,
        status,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  },
};
