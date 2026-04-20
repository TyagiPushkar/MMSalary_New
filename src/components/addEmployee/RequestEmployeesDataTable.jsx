import { IconAdd, IconDelete, IconEye, IconMoney } from "./AddEmployeeIcons";
import { ADD_EMPLOYEE_THEME, PAGE_SIZE } from "./addEmployeeTheme";

function RequestEmployeesDataTable({
  loading,
  pageRows,
  isSuper,
  addSalary,
  onView,
  onAddRegistration,
  onRemove,
}) {
  const { headerBlue } = ADD_EMPLOYEE_THEME;

  const cellBase =
    "border-b border-slate-200 px-3 py-2.5 align-middle text-sm text-slate-900";

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-2 p-8 text-slate-500">
          <span
            className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-[#1547bd]"
            aria-hidden
          />
          <span className="text-sm font-medium">Loading…</span>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 shadow-sm">
                <tr style={{ backgroundColor: headerBlue, color: "#fff" }}>
                  {[
                    "ID",
                    "Name",
                    "Phone",
                    "Office",
                    "Location",
                    "Role",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide border-b border-white/20 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {pageRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      No records match your filters.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row, rowIdx) => (
                    <tr
                      key={String(row.id ?? row.employeeid ?? `r-${rowIdx}`)}
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition"
                    >
                      <td className={`${cellBase} whitespace-nowrap`}>
                        {row.id ?? "—"}
                      </td>
                      <td className={`${cellBase} max-w-[180px] truncate`}>
                        {row.name ?? "—"}
                      </td>
                      <td className={`${cellBase} whitespace-nowrap`}>
                        {row.phone ?? "—"}
                      </td>
                      <td className={`${cellBase} whitespace-nowrap`}>
                        {row.officeid ?? "—"}
                      </td>
                      <td className={`${cellBase} max-w-[140px] truncate`}>
                        {row.location ?? "—"}
                      </td>
                      <td className={`${cellBase} max-w-[120px] truncate`}>
                        {row.employee_role ?? "—"}
                      </td>
                      <td className={`${cellBase} whitespace-nowrap`}>
                        <div className="flex flex-wrap items-center gap-1">
                          <button
                            type="button"
                            title="View details"
                            onClick={() => onView(row)}
                            className="inline-flex rounded-md p-1.5 text-[#1547bd] transition hover:bg-blue-100"
                          >
                            <IconEye />
                          </button>
                          {/* this for super user only */}
                          {isSuper && (
                            <button
                              type="button"
                              title="Add salary"
                              onClick={() => addSalary(row)}
                              className="inline-flex rounded-md p-1.5 text-emerald-700 transition hover:bg-emerald-100"
                            >
                              <IconAdd />
                            </button>
                          )}
                          {!isSuper && (
                            <button
                              type="button"
                              title="Add to system"
                              onClick={() => onAddRegistration(row)}
                              className="inline-flex rounded-md p-1.5 text-purple-700 transition hover:bg-purple-100"
                            >
                              <IconAdd />
                            </button>
                          )}
                          <button
                            type="button"
                            title="Remove from queue"
                            onClick={() => onRemove(row.id ?? row.employeeid)}
                            className="inline-flex rounded-md p-1.5 text-rose-600 transition hover:bg-rose-100"
                          >
                            <IconDelete />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default RequestEmployeesDataTable;
