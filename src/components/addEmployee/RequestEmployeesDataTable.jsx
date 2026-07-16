import { IconAdd, IconDelete, IconEye, IconMoney } from "./AddEmployeeIcons";
import { ADD_EMPLOYEE_THEME, PAGE_SIZE } from "./addEmployeeTheme";
import { useState, useEffect, useRef } from "react";

function RequestEmployeesDataTable({
  loading,
  pageRows,
  isSuper,
  addSalary,
  onView,
  onAddRegistration,
  onRemove,
  onReject,
}) {
  const { headerBlue } = ADD_EMPLOYEE_THEME;

  const [activeMenuId, setActiveMenuId] = useState(null);
  const dropdownRef = useRef(null);

  const cellBase =
    "border-b border-slate-200 px-3 py-2.5 align-middle text-sm text-slate-900";


    useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
                    "Date/Time Req",
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
                  // pageRows.map((row, rowIdx) => (
                   pageRows.map((row, rowIdx) => {
                    const currentRowId = row.id ?? row.employeeid ?? `r-${rowIdx}`;
                    const isMenuOpen = activeMenuId === currentRowId;

                    return (
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
                      <td className={`${cellBase} max-w-[140px] truncate`}>
                        {row.time ?? "—"}
                      </td>
                      <td className={`${cellBase} max-w-[120px] truncate`}>
                        {row.employee_role ?? "—"}
                      </td>
                      <td className={`${cellBase} whitespace-nowrap`}>
                        {/* <div className="flex flex-wrap items-center gap-1"> */}
                          <div className="inline-block text-left" ref={isMenuOpen ? dropdownRef : null}>
                           
                           <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(isMenuOpen ? null : currentRowId);
                              }}
                              className="inline-flex items-center justify-center p-2 rounded-full text-slate-600 hover:bg-slate-100 focus:outline-none transition-all duration-150"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" transform="rotate(90 12 12)" />
                              </svg>
                            </button>

                        {isMenuOpen && (
                              <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-30 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-100">

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

                           {/* 🎯 3. NEW: Reject Action Button (Amber Theme) */}
                          {isSuper && (
                          <button
                            type="button"
                            title="Reject Request"
                            onClick={() => onReject(row.id ?? row.employeeid)}
                            className="inline-flex rounded-md p-1.5 text-amber-600 transition hover:bg-amber-100 hover:scale-105 duration-150"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
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
                          )} 
                        </div>
                      </td>
                    </tr>
                  );
                  })
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
