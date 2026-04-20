import { USER_TYPES } from "./roles";

export const NAV_ITEMS = [
  // {
  //   key: "dashboard",
  //   label: "Dashboard",
  //   path: "/dashboard",
  //   types: [USER_TYPES.NORMAL, USER_TYPES.SUPER],
  // },
  {
    key: "attendance",
    label: "Attendance",
    path: "/attendance",
    types: [USER_TYPES.NORMAL, USER_TYPES.SUPER],
  },
  {
    key: "employees",
    label: "Employees",
    path: "/employees",
    types: [USER_TYPES.NORMAL, USER_TYPES.SUPER],
  },
  {
    key: "add_employee",
    label: "Add Employee",
    path: "/employee/add",
    types: [USER_TYPES.NORMAL, USER_TYPES.SUPER],
  },
  {
    key: "Manage admins",
    label: "Manage Admins",
    path: "/admins",
    types: [USER_TYPES.SUPER],
  },
  // {
  //   key: "salary",
  //   label: "Salary",
  //   path: "/salary",
  //   types: [USER_TYPES.SUPER],
  // },
  // {
  //   key: "reports",
  //   label: "Reports",
  //   path: "/reports",
  //   types: [USER_TYPES.SUPER],
  // },
  // {
  //   key: "settings",
  //   label: "Settings",
  //   path: "/settings",
  //   types: [USER_TYPES.SUPER],
  // },
];
