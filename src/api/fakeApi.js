import { fakeDb } from './fakeDb'

const wait = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))

const createToken = (user) => `fake-token-${user.type}-${user.id}-${Date.now()}`

export const fakeApi = {
  async login({ email, password }) {
    await wait()

    if (!email || !password) {
      return { status: false, message: 'Email and password required' }
    }

    const user = fakeDb.users.find((item) => item.email === email && item.password === password)
    if (!user) {
      return { status: false, message: 'Invalid email or password' }
    }

    return {
      status: true,
      message: 'Login successful',
      token: createToken(user),
      data: { id: user.id, name: user.name, email: user.email, type: user.type },
    }
  },

  async addEmployee(payload, token) {
    await wait()
    if (!token) {
      return { success: false, message: 'Unauthorized', data: [] }
    }

    const { name, phone, department, position } = payload
    if (!name || !phone) {
      return { success: false, message: 'Name & Phone required', data: [] }
    }

    const employee = {
      id: fakeDb.employees.length + 1,
      name,
      phone,
      department: department || 'General',
      position: position || 'Staff',
    }
    fakeDb.employees.unshift(employee)
    return { success: true, message: 'Employee added', data: [employee] }
  },

  async getEmployees() {
    await wait(300)
    return { success: true, data: fakeDb.employees }
  },

  async getAttendance() {
    await wait(300)
    return { success: true, data: fakeDb.attendance }
  },

  async getSalary() {
    await wait(300)
    return { success: true, data: fakeDb.salary }
  },

  async getReports() {
    await wait(300)
    return { success: true, data: fakeDb.reports }
  },
}
