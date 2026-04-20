import EmployeeDetailsView from './EmployeeDetailsView'
import { IconClose } from './AddEmployeeIcons'
import { ADD_EMPLOYEE_THEME } from './addEmployeeTheme'

function EmployeeDetailsModal({ open, employee, isSuper, onClose }) {
  if (!open || !employee) return null

  const { viewModalGradient, headerBlue } = ADD_EMPLOYEE_THEME

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="employee-details-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
        <div
          className="flex items-center justify-between px-4 py-4 text-white sm:px-5 sm:py-4"
          style={{ background: viewModalGradient }}
        >
          <span
            id="employee-details-modal-title"
            className="text-base font-bold sm:text-xl"
          >
            {isSuper ? '💰 Salary — employee details' : '👤 Employee details'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white transition hover:bg-white/15"
            aria-label="Close"
          >
            <IconClose />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto border-b border-slate-200 bg-slate-50/50 p-5 sm:max-h-[60vh]">
          <EmployeeDetailsView data={employee} />
        </div>

        <div className="flex justify-end bg-white px-4 py-3 sm:px-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-6 py-2 text-sm font-bold text-white shadow-md transition hover:brightness-110"
            style={{ backgroundColor: headerBlue }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDetailsModal
