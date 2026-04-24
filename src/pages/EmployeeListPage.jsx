import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageTitle from "../components/shared/PageTitle";
import StatusToggle from "../components/shared/StatusToggle";
import { FiEye, FiEdit2 } from "react-icons/fi";
import {
  fetchEmployeesThunk,
  fetchRequestEmployeesThunk,
  updateEmployeeDetailsThunk,
  updateEmployeeStatusThunk,
} from "../store/slices/employeeSlice";
import { fetchOfficesThunk } from "../store/slices/officeSlice";

const HEADER_BLUE = "#1547bd";

// Essential columns only for clean UI
const ESSENTIAL_COLUMNS = [
  { key: "employeeid", label: "Employee ID", minW: "min-w-[100px]" },
  { key: "name", label: "Name", minW: "min-w-[140px]" },
  { key: "phone", label: "Phone", minW: "min-w-[110px]" },
  { key: "employee_role", label: "Role", minW: "min-w-[100px]" },
  { key: "officeid", label: "Office ID", minW: "min-w-[100px]" },
  {
    key: "multi_officeids",
    label: "Multiple Office",
    minW: "min-w-[140px]",
  },
];

// All columns for detail view
const ALL_COLUMNS = [
  { key: "employeeid", label: "Employee ID" },
  { key: "name", label: "Name" },
  { key: "phone", label: "Phone" },
  { key: "officeid", label: "Office ID" },
  { key: "multiple_office", label: "Multiple Office" },
  { key: "location", label: "Location" },
  { key: "employee_role", label: "Employee Role" },
  { key: "aadhar_number", label: "Aadhar Number" },
  { key: "pan_card", label: "PAN Card" },
  { key: "driving_license_no", label: "Driving License No." },
  { key: "rc_number", label: "RC Number" },
  { key: "ac_name", label: "Account Name" },
  { key: "ifsc", label: "IFSC" },
  { key: "account_num", label: "Account Number" },
  { key: "salary", label: "Salary" },
  { key: "amazon_login_id", label: "Amazon Login ID" },
];

function getRowKey(row, index) {
  if (row.id != null && row.id !== "") return String(row.id);
  if (row.employeeid != null && row.employeeid !== "")
    return String(row.employeeid);
  return `row-${index}`;
}

function cellValue(row, key) {
  const v = row[key];
  if (v == null || v === "") return "—";
  return String(v);
}

function exportCsv(rows, suffix = "employees") {
  if (!rows.length) return;
  const keys = [...ESSENTIAL_COLUMNS.map((c) => c.key), "id"];
  const uniqueKeys = [...new Set(keys)];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = uniqueKeys.join(",");
  const body = rows
    .map((r) => uniqueKeys.map((k) => esc(r[k])).join(","))
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${suffix}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function EmployeeListPage() {
  const dispatch = useDispatch();
  const {
    items,
    requestItems,
    loading,
    requestLoading,
    updateLoading,
    statusUpdateLoading,
  } = useSelector((state) => state.employees);

  const [listMode, setListMode] = useState("directory");
  const [quickFilter, setQuickFilter] = useState("");
  const [density, setDensity] = useState("normal");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [multiOfficeIds, setMultiOfficeIds] = useState([]);

  // Detail View Modal statsuper
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);

  const { items: officeItems } = useSelector((state) => state.offices);
  // Edit Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [accountNum, setAccountNum] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [salary, setSalary] = useState("");
  const [fuel, setFuel] = useState("");
  const [phoneCost, setPhoneCost] = useState("");
  const [basic, setBasic] = useState("");
  const [da, setDa] = useState("");
  const [hra, setHra] = useState("");

  const [banner, setBanner] = useState(null);
  const [modalError, setModalError] = useState(null);
  useEffect(() => {
    dispatch(fetchOfficesThunk()); // ✅ ADD THIS
  }, [dispatch]);

  useEffect(() => {
    if (listMode === "directory") {
      dispatch(fetchEmployeesThunk());
    } else {
      dispatch(fetchRequestEmployeesThunk());
    }
  }, [dispatch, listMode]);

  const tableRows = listMode === "directory" ? items : requestItems;
  const tableLoading = listMode === "directory" ? loading : requestLoading;

  const filteredRows = useMemo(() => {
    const q = quickFilter.trim().toLowerCase();
    if (!q) return tableRows;
    return tableRows.filter((row) =>
      Object.values(row).some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [tableRows, quickFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  const currentPage = Math.min(Math.max(1, page), totalPages);
  const pageRows = filteredRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const cellPad = density === "compact" ? "px-2 py-1.5" : "px-3 py-2.5";
  const textSize = density === "compact" ? "text-xs" : "text-sm";

  // Open detail view modal
  const openDetailView = (row) => {
    setDetailRow(row);
    setDetailModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (row) => {
    setEditRow(row);
    setAccountNum(row.account_num ?? "");
    setIfsc(row.ifsc ?? "");
    setSalary(row.salary ?? "");
    setFuel(row.fuel ?? "");
    setPhoneCost(row.phone_cost ?? "");
    setBasic(row.basic ?? "");
    setDa(row.DA ?? "");
    setHra(row.HRA ?? "");
    setMultiOfficeIds(
      row.multi_officeids ? String(row.multi_officeids).split(",") : [],
    );
    setEditModalOpen(true);
    setModalError(null);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setDetailRow(null);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditRow(null);
  };

  // Handle employee status update with API call
  const handleStatusToggle = async (employee) => {
    const employeeid = employee.employeeid; // use employeeid (NOT id)
    const currentStatus = employee.status == 1 ? 1 : 0;
    const newStatus = currentStatus === 1 ? 0 : 1;

    try {
      await dispatch(
        updateEmployeeStatusThunk({
          employeeid,
          status: newStatus,
        }),
      ).unwrap();

      setBanner({
        type: "success",
        text: `Employee status updated successfully`,
      });

      // refresh list
      if (listMode === "directory") {
        dispatch(fetchEmployeesThunk());
      } else {
        dispatch(fetchRequestEmployeesThunk());
      }
    } catch (err) {
      setBanner({
        type: "error",
        text: err || "Failed to update status",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editRow) return;
    setModalError(null);
    const payload = {
      employeeid: editRow.employeeid,
      account_num: accountNum,
      ifsc,
      salary,
      fuel,
      phone_cost: phoneCost,
      basic,
      DA: da,
      HRA: hra,
      multi_officeids: multiOfficeIds, // ✅ ADD THIS
    };
    try {
      const result = await dispatch(
        updateEmployeeDetailsThunk(payload),
      ).unwrap();
      if (listMode === "directory") {
        await dispatch(fetchEmployeesThunk());
      } else {
        await dispatch(fetchRequestEmployeesThunk());
      }
      closeEditModal();
      setBanner({
        type: "success",
        text: result.message || "Updated successfully.",
      });
    } catch (err) {
      setModalError(err || "Failed to update employee details.");
    }
  };

  return (
    <section className="flex flex-col gap-4 overflow-hidden">
      <PageTitle
        title="Manage Employees"
        subtitle={
          listMode === "directory"
            ? "Full directory (get_all / by office). Search, filter, view details, edit."
            : "Request queue (getall_req_employee / Register by office). View and manage requests."
        }
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setListMode("directory");
            setPage(1);
            setQuickFilter("");
          }}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            listMode === "directory"
              ? "text-white shadow"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
          style={
            listMode === "directory"
              ? { backgroundColor: HEADER_BLUE }
              : undefined
          }
        >
          All Employees
        </button>
        <button
          type="button"
          onClick={() => {
            setListMode("requests");
            setPage(1);
            setQuickFilter("");
          }}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
            listMode === "requests"
              ? "text-white shadow"
              : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
          }`}
          style={
            listMode === "requests"
              ? { backgroundColor: HEADER_BLUE }
              : undefined
          }
        >
          Request Employees
        </button>
      </div>

      {banner && !editModalOpen && !detailModalOpen ? (
        <div
          className={`rounded-lg px-4 py-2 text-sm ${
            banner.type === "success"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-rose-50 text-rose-800"
          }`}
        >
          {banner.text}
        </div>
      ) : null}

      <div
        className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        style={{ minHeight: "70vh" }}
      >
        <div
          className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-3 py-2"
          style={{ color: HEADER_BLUE }}
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Toolbar
          </span>
          <button
            type="button"
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium hover:bg-slate-50"
            style={{ color: HEADER_BLUE }}
            onClick={() => {
              setQuickFilter("");
              setPage(1);
            }}
          >
            Clear filter
          </button>
          <button
            type="button"
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium hover:bg-slate-50"
            style={{ color: HEADER_BLUE }}
            onClick={() =>
              setDensity((d) => (d === "normal" ? "compact" : "normal"))
            }
          >
            Density: {density === "normal" ? "Standard" : "Compact"}
          </button>
          <button
            type="button"
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium hover:bg-slate-50"
            style={{ color: HEADER_BLUE }}
            onClick={() =>
              exportCsv(
                filteredRows,
                listMode === "directory" ? "employees" : "request-employees",
              )
            }
          >
            Export CSV
          </button>
          <div className="ml-auto flex min-w-[200px] max-w-md flex-1 items-center gap-2">
            <label htmlFor="emp-quick-filter" className="sr-only">
              Quick filter
            </label>
            <input
              id="emp-quick-filter"
              type="search"
              placeholder="Search table…"
              value={quickFilter}
              onChange={(e) => {
                setQuickFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-[#1547bd]"
            />
          </div>
        </div>

        {tableLoading ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-slate-500">Loading employees…</p>
          </div>
        ) : pageRows.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-slate-500">No employees found.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-x-auto overflow-y-auto">
              <table className={`w-full border-collapse ${textSize}`}>
                <thead className="sticky top-0 z-[1] shadow-sm">
                  <tr style={{ backgroundColor: HEADER_BLUE, color: "#fff" }}>
                    <th
                      className={`${cellPad} text-left font-semibold whitespace-nowrap border-b border-white/20 w-12`}
                      title="View employee details"
                    >
                      View
                    </th>
                    {ESSENTIAL_COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        className={`${cellPad} text-left font-semibold whitespace-nowrap border-b border-white/20 ${col.minW}`}
                      >
                        {col.label}
                      </th>
                    ))}
                    <th
                      className={`${cellPad} text-left font-semibold whitespace-nowrap border-b border-white/20 w-16`}
                      title="Toggle active/inactive status"
                    >
                      Status
                    </th>
                    <th
                      className={`${cellPad} text-left font-semibold whitespace-nowrap border-b border-white/20 min-w-[100px]`}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {pageRows.map((row, idx) => {
                    const globalIndex = (currentPage - 1) * pageSize + idx + 1;
                    const rk = getRowKey(row, idx);
                    const isActive = row.status == 1;

                    return (
                      <tr
                        key={`${rk}-${globalIndex}`}
                        className={`border-b border-slate-100 transition ${
                          isActive
                            ? "hover:bg-slate-50/80"
                            : "bg-slate-50/40 hover:bg-slate-50/60"
                        }`}
                      >
                        {/* View Icon Button */}
                        <td
                          className={`${cellPad} text-center whitespace-nowrap`}
                        >
                          <button
                            type="button"
                            onClick={() => openDetailView(row)}
                            className="rounded-md p-1.5 text-sm transition hover:bg-blue-100"
                            style={{ color: HEADER_BLUE }}
                            title="View employee details"
                          >
                            <FiEye size={18} />
                          </button>
                        </td>

                        {/* Essential Columns */}
                        {ESSENTIAL_COLUMNS.map((col) => (
                          <td
                            key={col.key}
                            className={`${cellPad} text-slate-800 whitespace-nowrap max-w-[220px] truncate`}
                            title={cellValue(row, col.key)}
                          >
                            {cellValue(row, col.key)}
                          </td>
                        ))}

                        {/* Status Toggle Slide Button */}
                        <td
                          className={`${cellPad} text-center whitespace-nowrap`}
                        >
                          <StatusToggle
                            isActive={isActive}
                            onToggle={() => handleStatusToggle(row)}
                            disabled={statusUpdateLoading}
                            loading={statusUpdateLoading}
                          />
                        </td>

                        {/* Action Buttons */}
                        <td className={`${cellPad} whitespace-nowrap`}>
                          <button
                            type="button"
                            onClick={() => openEditModal(row)}
                            className="rounded-md p-1.5 text-sm transition hover:bg-blue-100"
                            style={{
                              color: HEADER_BLUE,
                            }}
                            title="Edit employee details"
                          >
                            <FiEdit2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-3 py-2 text-sm"
              style={{ backgroundColor: HEADER_BLUE, color: "#fff" }}
            >
              <span>
                {filteredRows.length === 0
                  ? "No rows"
                  : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(
                      currentPage * pageSize,
                      filteredRows.length,
                    )} of ${filteredRows.length}`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setPage((p) => {
                      const c = Math.min(Math.max(1, p), totalPages);
                      return Math.max(1, c - 1);
                    })
                  }
                  className="rounded border border-white/40 px-2 py-1 text-xs disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-xs">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setPage((p) => {
                      const c = Math.min(Math.max(1, p), totalPages);
                      return Math.min(totalPages, c + 1);
                    })
                  }
                  className="rounded border border-white/40 px-2 py-1 text-xs disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {detailModalOpen && detailRow ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-employee-title"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="detail-employee-title"
                className="text-lg font-semibold text-slate-900"
              >
                Employee Details: {detailRow?.name || "N/A"} (
                {detailRow?.employeeid || "N/A"})
              </h2>
              <button
                type="button"
                onClick={closeDetailModal}
                className="text-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ALL_COLUMNS.map((col) => (
                <div key={col.key} className="block text-sm">
                  <span className="mb-1 block font-medium text-slate-700">
                    {col.label}
                  </span>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                    {cellValue(detailRow, col.key)}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeDetailModal}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  closeDetailModal();
                  openEditModal(detailRow);
                }}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: HEADER_BLUE }}
              >
                Edit Employee
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {editModalOpen && editRow ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-employee-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="edit-employee-title"
                className="text-lg font-semibold text-slate-900"
              >
                Edit Employee: {editRow?.name || "N/A"} (
                {editRow?.employeeid || "N/A"})
              </h2>
              <button
                type="button"
                onClick={closeEditModal}
                className="text-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {modalError ? (
              <p className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">
                {modalError}
              </p>
            ) : null}

            {/* Read-only Fields */}
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Name
                </span>
                <input
                  readOnly
                  value={editRow.name ?? ""}
                  className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-700"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Employee ID
                </span>
                <input
                  readOnly
                  value={editRow.employeeid ?? ""}
                  className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-700"
                />
              </label>
            </div>

            <hr className="mb-4 border-slate-200" />

            {/* Editable Fields */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Account Number
                </span>
                <input
                  value={accountNum}
                  onChange={(e) => setAccountNum(e.target.value)}
                  className="w-full rounded-lg border border-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1547bd]/30"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  IFSC
                </span>
                <input
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  className="w-full rounded-lg border border-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1547bd]/30"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Salary
                </span>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full rounded-lg border border-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1547bd]/30"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Fuel
                </span>
                <input
                  type="number"
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value)}
                  className="w-full rounded-lg border border-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1547bd]/30"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Phone Cost
                </span>
                <input
                  type="number"
                  value={phoneCost}
                  onChange={(e) => setPhoneCost(e.target.value)}
                  className="w-full rounded-lg border border-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1547bd]/30"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Basic
                </span>
                <input
                  type="number"
                  value={basic}
                  onChange={(e) => setBasic(e.target.value)}
                  className="w-full rounded-lg border border-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1547bd]/30"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  DA
                </span>
                <input
                  type="number"
                  value={da}
                  onChange={(e) => setDa(e.target.value)}
                  className="w-full rounded-lg border border-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1547bd]/30"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  HRA
                </span>
                <input
                  type="number"
                  value={hra}
                  onChange={(e) => setHra(e.target.value)}
                  className="w-full rounded-lg border border-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1547bd]/30"
                />
              </label>
              <label className="">
                <span className="mb-2 block font-medium text-slate-700">
                  Multi Office IDs
                </span>
                {/* this was the multi office IDs */}
                <div className="grid max-h-40 grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-slate-300 p-2">
                  {(officeItems || []).map((office) => {
                    const isChecked = multiOfficeIds.includes(String(office));

                    return (
                      <label
                        key={office}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-slate-100"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setMultiOfficeIds((prev) => [
                                ...prev,
                                String(office),
                              ]);
                            } else {
                              setMultiOfficeIds((prev) =>
                                prev.filter((id) => id !== String(office)),
                              );
                            }
                          }}
                        />

                        <span className="text-xs text-slate-700">{office}</span>
                      </label>
                    );
                  })}
                </div>
              </label>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updateLoading}
                onClick={handleUpdate}
                className="rounded-lg px-5 py-2 text-sm font-semibold text-white disabled:opacity-60 hover:opacity-90"
                style={{ backgroundColor: HEADER_BLUE }}
              >
                {updateLoading ? "Updating…" : "Update"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default EmployeeListPage;
