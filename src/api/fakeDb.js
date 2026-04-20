import { USER_TYPES } from "../constants/roles";

export const fakeDb = {
  users: [
    {
      id: 1,
      email: "super@office.com",
      password: "123456",
      type: USER_TYPES.SUPER,
      name: "Super Admin",
    },
    {
      id: 2,
      email: "normal@office.com",
      password: "123456",
      type: USER_TYPES.NORMAL,
      name: "Office Admin",
    },
  ],
  employees: [
    {
      id: 1,
      name: "Amit Sharma",
      phone: "9991112233",
      department: "Sales",
      position: "Executive",
      is_active: true,
    },
    {
      id: 2,
      name: "Neha Verma",
      phone: "9992223344",
      department: "HR",
      position: "Manager",
      is_active: true,
    },
  ],
  attendance: [
    { id: 1, employee: "Amit Sharma", date: "2026-04-15", status: "Present" },
    { id: 2, employee: "Neha Verma", date: "2026-04-15", status: "Absent" },
  ],
  salary: [
    {
      id: 1,
      employee: "Amit Sharma",
      month: "Apr-2026",
      amount: 35000,
      paid: true,
    },
    {
      id: 2,
      employee: "Neha Verma",
      month: "Apr-2026",
      amount: 48000,
      paid: false,
    },
  ],
  reports: [
    { id: 1, title: "Attendance Summary", generatedAt: "2026-04-10" },
    { id: 2, title: "Monthly Salary Report", generatedAt: "2026-04-11" },
  ],
};
