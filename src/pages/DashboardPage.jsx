import { useSelector } from 'react-redux'
import InfoCard from '../components/shared/InfoCard'
import PageTitle from '../components/shared/PageTitle'

function DashboardPage() {
  const { user } = useSelector((state) => state.auth)
  const employeeCount = useSelector((state) => state.employees.items.length)
  const attendanceCount = useSelector((state) => state.attendance.items.length)

  return (
    <section>
      <PageTitle title="Dashboard" subtitle={`Welcome back, ${user?.name}`} />
      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard label="Role" value={(user?.type || '').toUpperCase()} />
        <InfoCard label="Employees" value={employeeCount} />
        <InfoCard label="Attendance Records" value={attendanceCount} />
      </div>
    </section>
  )
}

export default DashboardPage
