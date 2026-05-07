import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageTitle from "../components/shared/PageTitle";
import StatusToggle from "../components/shared/StatusToggle";
import { FiEye, FiEdit2, FiRefreshCw, FiSearch, FiX } from "react-icons/fi";
import {
  fetchAllAdminsThunk,
  updateAdminStatusThunk,
  updateAdminDetailsThunk,
  createSupervisorThunk,
} from "../store/slices/adminSlice";
import { fetchOfficesThunk } from "../store/slices/officeSlice";
import { fetchEmployeesThunk } from "../store/slices/employeeSlice";
import axios from "axios";

const HEADER_BLUE = "#1547bd";

// Essential columns only for clean UI
const ESSENTIAL_COLUMNS = [
  { key: "admin_name", label: "Admin Name", minW: "min-w-[130px]" },
  { key: "email", label: "Email", minW: "min-w-[140px]" },
  { key: "phone", label: "Phone", minW: "min-w-[90px]" },
  { key: "officeid", label: "Office ID", minW: "min-w-[80px]" },
  { key: "multi_officeid", label: "Multi Office", minW: "min-w-[90px]" },
];

// All columns for detail view
const ALL_COLUMNS = [
  { key: "admin_name", label: "Admin Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "officeid", label: "Office ID" },
  { key: "multi_officeid", label: "Multiple Office" },
  { key: "city", label: "City" },
  { key: "address", label: "Address" },
  { key: "lat", label: "Latitude" },
  { key: "lon", label: "Longitude" },
  { key: "type", label: "Type" },
  { key: "position", label: "Position" },
  { key: "station_type", label: "Station Type" },
  { key: "deviceid", label: "Device ID" },
  { key: "active_status", label: "Active Status" },
];

//All columns for edit view
const EDITABLE_COLUMNS = [
  { key: "admin_name", label: "Admin Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "officeid", label: "Office ID" },
  { key: "multi_officeid", label: "Multiple Office" },
  { key: "city", label: "City" },
  { key: "address", label: "Address" },
  { key: "lat", label: "Latitude" },
  { key: "lon", label: "Longitude" },
  { key: "admin_password", label: "Password" },
  { key: "type", label: "Type" },
  { key: "position", label: "Position" },
  { key: "station_type", label: "Station Type" },
];

function getRowKey(row, index) {
  if (row.email != null && row.email !== "") return String(row.email);
  return `row-${index}`;
}

function cellValue(row, key) {
  const v = row[key];
  if (v == null || v === "") return "—";
  return String(v);
}

function exportCsv(rows, suffix = "admins") {
  if (!rows.length) return;
  const keys = [...ESSENTIAL_COLUMNS.map((c) => c.key), "email"];
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

function ManageAdminPage() {
  const dispatch = useDispatch();
  const { items, loading, statusUpdateLoading, updateLoading } = useSelector(
    (state) => state.admins,
  );
  const { items: offices } = useSelector((state) => state.offices);
  const { items: employees } = useSelector((state) => state.employees);

  const [quickFilter, setQuickFilter] = useState("");
  const [density, setDensity] = useState("normal");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Detail View Modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);

  // Edit Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [multiSelectOpen, setMultiSelectOpen] = useState(false);
  const [listMode, setListMode] = useState("directory");
  const [banner, setBanner] = useState(null);
  const [modalError, setModalError] = useState(null);

  //add supervisor modal state
  const [showAddSupervisorModal, setShowAddSupervisorModal] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [supervisorFormData, setSupervisorFormData] = useState({
    email: "",
    admin_password: "",
    officeid: "",
    // multi_officeid: "",
  });

  useEffect(() => {
    dispatch(fetchAllAdminsThunk());
    dispatch(fetchOfficesThunk());
    dispatch(fetchEmployeesThunk());
  }, [dispatch]);

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch.trim()) return [];
    const searchTerm = employeeSearch.toLowerCase().trim();
    return employees.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(searchTerm) ||
        emp.employeeid?.toLowerCase().includes(searchTerm) ||
        emp.email?.toLowerCase().includes(searchTerm) ||
        emp.phone?.includes(searchTerm),
    );
  }, [employees, employeeSearch]);

  const filteredRows = useMemo(() => {
    const q = quickFilter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((row) =>
      Object.values(row).some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [items, quickFilter]);

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
    const formData = {};
    EDITABLE_COLUMNS.forEach((col) => {
      formData[col.key] = row[col.key] ?? "";
    });
    setEditFormData(formData);
    setEditModalOpen(true);
    setMultiSelectOpen(false);
    setModalError(null);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setDetailRow(null);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditRow(null);
    setMultiSelectOpen(false);
  };

  const openAddSupervisorModal = () => {
    setSelectedEmployee(null);
    setEmployeeSearch("");
    setSupervisorFormData({
      email: "",
      admin_password: "",
      officeid: "",
      multi_officeid: "",
    });
    setShowAddSupervisorModal(true);
    setModalError(null);
  };

  const selectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeSearch(employee.name);
    setShowDropdown(false);
    // Auto-fill form data from selected employee
    setSupervisorFormData({
      email: "",
      admin_password: "",
      officeid: "",
      // multi_officeid: "",
    });
  };

  const handleSupervisorChange = (key, value) => {
    setSupervisorFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getFullImageUrl = (path) => {
    if (!path || path === "None") return null;
    if (path.startsWith("http")) return path;
    return `https://namami-infotech.com/MMSalary/uploads/${path}`;
  };

  //handle reset mobile devices
  const handleResetMobile = async (admin) => {
    const adminId = admin?.id || admin?.admin_id;
    if (!adminId) {
      setBanner({ type: "error", text: "Invalid admin ID" });
      return;
    }
    console.log("Resetting mobile for admin ID:", adminId);
    try {
      const res = await axios.post(
        "https://namami-infotech.com/MMSalary/office_admin/reset_mobile.php",
        {
          user_id: admin.id,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("mmsalary_token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.data.status) {
        throw new Error(res.data.message);
      }

      setBanner({
        type: "success",
        text: res.data.message || "Device reset successfully",
      });

      dispatch(fetchAllAdminsThunk());
    } catch (err) {
      setBanner({
        type: "error",
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to reset device",
      });
    }
  };

  // Handle admin status update with API call
  const handleStatusToggle = async (admin) => {
    const adminId = admin.email;
    const currentStatus = admin.active_status == 1 ? 1 : 0;
    const newStatus = currentStatus === 1 ? 0 : 1;

    try {
      await dispatch(
        updateAdminStatusThunk({
          adminId,
          isActive: newStatus,
        }),
      ).unwrap();

      setBanner({
        type: "success",
        text: `Admin status updated successfully`,
      });

      dispatch(fetchAllAdminsThunk());
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
      ...editFormData,
    };
    console.log("Updating admin with payload:", payload);
  };

  const handleAddSupervisor = async () => {
    if (!selectedEmployee) {
      setModalError("Please select an employee first");
      return;
    }

    if (!supervisorFormData.admin_password) {
      setModalError("Please enter a password");
      return;
    }

    const payload = {
      employeeid: selectedEmployee.employeeid,
      email: supervisorFormData.email,
      password: supervisorFormData.admin_password,
      officeid: supervisorFormData.officeid,
      multi_officeid: supervisorFormData.multi_officeid,
      name: selectedEmployee.name,
      phone: selectedEmployee.phone,
    };

    console.log("Adding supervisor with payload:", payload);

    try {
      await dispatch(createSupervisorThunk(payload)).unwrap();
      await dispatch(fetchAllAdminsThunk());
      setShowAddSupervisorModal(false);
      setBanner({
        type: "success",
        text: "Supervisor added successfully",
      });
      setTimeout(() => setBanner(null), 3000);
    } catch (err) {
      setModalError(err || "Failed to add supervisor");
    }
  };

  return (
    <section className="flex flex-col gap-4 overflow-hidden">
      <PageTitle
        title="Manage Admins"
        subtitle="Manage all admin accounts. View details, update information, and control access."
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
          onClick={openAddSupervisorModal}
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
          Add Supervisor
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
            onClick={() => exportCsv(filteredRows, "admins")}
          >
            Export CSV
          </button>
          <div className="ml-auto flex min-w-[200px] max-w-md flex-1 items-center gap-2">
            <label htmlFor="admin-quick-filter" className="sr-only">
              Quick filter
            </label>
            <input
              id="admin-quick-filter"
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

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-slate-500">Loading admins…</p>
          </div>
        ) : pageRows.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-slate-500">No admins found.</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-x-auto overflow-y-auto">
              <table className={`w-full border-collapse ${textSize}`}>
                <thead className="sticky top-0 z-[1] shadow-sm">
                  <tr style={{ backgroundColor: HEADER_BLUE, color: "#fff" }}>
                    <th
                      className="px-2 py-2 text-left font-semibold whitespace-nowrap border-b border-white/20 w-10"
                      title="View admin details"
                    >
                      View
                    </th>
                    {ESSENTIAL_COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        className={`px-2 py-2 text-left font-semibold whitespace-nowrap border-b border-white/20 ${col.minW}`}
                      >
                        {col.label}
                      </th>
                    ))}
                    <th
                      className="px-2 py-2 text-left font-semibold whitespace-nowrap border-b border-white/20 w-10"
                      title="Reset admin mobile"
                    >
                      Reset
                    </th>
                    <th
                      className="px-2 py-2 text-left font-semibold whitespace-nowrap border-b border-white/20 w-14"
                      title="Toggle active/inactive status"
                    >
                      Status
                    </th>
                    <th className="px-2 py-2 text-left font-semibold whitespace-nowrap border-b border-white/20 w-10">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {pageRows.map((row, idx) => {
                    const globalIndex = (currentPage - 1) * pageSize + idx + 1;
                    const rk = getRowKey(row, idx);
                    const isActive = row.active_status == 1;

                    return (
                      <tr
                        key={`${rk}-${globalIndex}`}
                        className={`border-b border-slate-100 transition ${
                          isActive
                            ? "hover:bg-slate-50/80"
                            : "bg-slate-50/40 hover:bg-slate-50/60"
                        }`}
                      >
                        <td className="px-2 py-2 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openDetailView(row)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-blue-100"
                            style={{ color: HEADER_BLUE }}
                            title="View admin details"
                          >
                            <FiEye size={16} />
                          </button>
                        </td>
                        {ESSENTIAL_COLUMNS.map((col) => (
                          <td
                            key={col.key}
                            className="px-2 py-2 text-slate-800 whitespace-nowrap max-w-[200px] truncate text-xs"
                            title={cellValue(row, col.key)}
                          >
                            {cellValue(row, col.key)}
                          </td>
                        ))}
                        <td className="px-2 py-2 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleResetMobile(row)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition hover:bg-blue-100"
                            style={{ color: HEADER_BLUE }}
                            title="Reset admin mobile"
                          >
                            <FiRefreshCw size={16} />
                          </button>
                        </td>
                        <td className="px-2 py-2 text-center whitespace-nowrap">
                          <StatusToggle
                            isActive={isActive}
                            onToggle={() => handleStatusToggle(row)}
                            disabled={statusUpdateLoading}
                            loading={statusUpdateLoading}
                          />
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={() => openEditModal(row)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-blue-100"
                            style={{
                              color: HEADER_BLUE,
                            }}
                            title="Edit admin details"
                          >
                            <FiEdit2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-3 py-1.5 text-xs"
              style={{ backgroundColor: HEADER_BLUE, color: "#fff" }}
            >
              <span className="text-xs">
                {filteredRows.length === 0
                  ? "No rows"
                  : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(
                      currentPage * pageSize,
                      filteredRows.length,
                    )} of ${filteredRows.length}`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setPage((p) => {
                      const c = Math.min(Math.max(1, p), totalPages);
                      return Math.max(1, c - 1);
                    })
                  }
                  className="rounded border border-white/40 px-2 py-0.5 text-xs disabled:opacity-40 hover:bg-white/10"
                >
                  ← Prev
                </button>
                <span className="px-1 text-xs">
                  {currentPage} / {totalPages}
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
                  className="rounded border border-white/40 px-2 py-0.5 text-xs disabled:opacity-40 hover:bg-white/10"
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {detailModalOpen && detailRow ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="detail-admin-title"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="detail-admin-title"
                className="text-lg font-semibold text-slate-900"
              >
                Admin Details: {detailRow?.admin_name || "N/A"} (
                {detailRow?.email || "N/A"})
              </h2>
              <button
                type="button"
                onClick={closeDetailModal}
                className="text-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

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
                Edit Admin
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Edit Modal */}
      {editModalOpen && editRow ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-admin-title"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="edit-admin-title"
                className="text-lg font-semibold text-slate-900"
              >
                Edit Admin: {editRow?.admin_name || "N/A"} (
                {editRow?.email || "N/A"})
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {EDITABLE_COLUMNS.map((col) => {
                const isTextarea =
                  col.key === "address" || col.key === "admin_password";
                const isMultiSelect = col.key === "multi_officeid";
                const isReadOnly = false;
                const value = editFormData[col.key] ?? "";

                return (
                  <label
                    key={col.key}
                    className={`block text-sm ${isTextarea ? "sm:col-span-2" : ""}`}
                  >
                    <span className="mb-1 block font-medium text-slate-700">
                      {col.label}
                    </span>
                    {isMultiSelect ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setMultiSelectOpen(!multiSelectOpen)}
                          className="w-full rounded-lg border border-slate-900 px-3 py-2 text-left text-sm bg-white text-slate-700 hover:bg-slate-50 focus:ring-2 focus:ring-[#1547bd]/30 outline-none"
                        >
                          {value
                            ? `${
                                String(value).split(",").filter(Boolean).length
                              } office(s) selected`
                            : "Select Offices"}
                        </button>
                        {multiSelectOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-900 rounded-lg shadow-lg z-10">
                            <div className="flex flex-col gap-2 p-3 max-h-48 overflow-y-auto">
                              {Object.keys(offices).length === 0 ? (
                                <p className="text-sm text-slate-500">
                                  No offices available
                                </p>
                              ) : (
                                Object.entries(offices).map(([key, office]) => {
                                  const officeId =
                                    typeof office === "object" &&
                                    office !== null
                                      ? office.id
                                      : key;
                                  const officeName =
                                    typeof office === "object" &&
                                    office !== null
                                      ? office.officename || office.office_name
                                      : office;

                                  const selectedIds = value
                                    ? String(value)
                                        .split(",")
                                        .map((id) => id.trim())
                                    : [];
                                  const isSelected = selectedIds.includes(
                                    String(officeId),
                                  );

                                  return (
                                    <label
                                      key={key}
                                      className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1 rounded"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            const newIds = [
                                              ...selectedIds,
                                              String(officeId),
                                            ];
                                            setEditFormData({
                                              ...editFormData,
                                              [col.key]: newIds.join(","),
                                            });
                                          } else {
                                            const newIds = selectedIds.filter(
                                              (id) => id !== String(officeId),
                                            );
                                            setEditFormData({
                                              ...editFormData,
                                              [col.key]: newIds.join(","),
                                            });
                                          }
                                        }}
                                        className="rounded"
                                      />
                                      <span className="text-sm text-slate-700">
                                        {officeName}
                                      </span>
                                    </label>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : isTextarea ? (
                      <textarea
                        value={value}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            [col.key]: e.target.value,
                          })
                        }
                        rows="2"
                        readOnly={isReadOnly}
                        className={`w-full rounded-lg border px-3 py-2 outline-none ${
                          isReadOnly
                            ? "border-slate-300 bg-slate-100 text-slate-700"
                            : "border-slate-900 focus:ring-2 focus:ring-[#1547bd]/30"
                        }`}
                      />
                    ) : (
                      <input
                        type={
                          col.key === "admin_password" ? "password" : "text"
                        }
                        value={value}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            [col.key]: e.target.value,
                          })
                        }
                        readOnly={isReadOnly}
                        className={`w-full rounded-lg border px-3 py-2 outline-none ${
                          isReadOnly
                            ? "border-slate-300 bg-slate-100 text-slate-700"
                            : "border-slate-900 focus:ring-2 focus:ring-[#1547bd]/30"
                        }`}
                      />
                    )}
                  </label>
                );
              })}
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
                onClick={handleUpdate}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: HEADER_BLUE }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Add Supervisor Modal - Updated with Employee Search */}
      {showAddSupervisorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Add Supervisor
              </h2>
              <button
                type="button"
                onClick={() => setShowAddSupervisorModal(false)}
                className="text-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <p className="mb-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">
                {modalError}
              </p>
            )}

            <div className="space-y-4">
              {/* Employee Search Field */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Search Employee <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FiSearch
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Search by name, employee ID, email or phone..."
                    value={employeeSearch}
                    onChange={(e) => {
                      setEmployeeSearch(e.target.value);
                      setShowDropdown(true);
                      if (!e.target.value) {
                        setSelectedEmployee(null);
                      }
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/30"
                  />
                  {showDropdown && filteredEmployees.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      {filteredEmployees.map((emp) => (
                        <button
                          key={emp.id || emp.employeeid}
                          type="button"
                          onClick={() => selectEmployee(emp)}
                          className="w-full text-left p-3 hover:bg-blue-50 transition-all duration-200 border-b border-slate-100 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            {emp.photo && (
                              <img
                                src={getFullImageUrl(emp.photo)}
                                className="w-10 h-10 rounded-full object-cover"
                                alt={emp.name}
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-slate-800 text-sm">
                                {emp.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                ID: {emp.employeeid} • {emp.phone}{" "}
                                {emp.email ? `• ${emp.email}` : ""}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {selectedEmployee && (
                  <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-600 font-semibold">
                      Selected Employee:
                    </p>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedEmployee.name}
                    </p>
                    <p className="text-xs text-slate-600">
                      ID: {selectedEmployee.employeeid} • Phone:{" "}
                      {selectedEmployee.phone}
                    </p>
                  </div>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={supervisorFormData.email}
                  onChange={(e) =>
                    handleSupervisorChange("email", e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/30"
                  placeholder="supervisor@example.com"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={supervisorFormData.admin_password}
                  onChange={(e) =>
                    handleSupervisorChange("admin_password", e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/30"
                  placeholder="Enter password"
                />
              </div>

              {/* Office ID Field */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Primary Office ID{" "}
                </label>
                <select
                  value={supervisorFormData.officeid}
                  onChange={(e) =>
                    handleSupervisorChange("officeid", e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/30"
                >
                  <option value="">Select Office</option>
                  {Object.entries(offices).map(([key, office]) => {
                    const officeId =
                      typeof office === "object" && office !== null
                        ? office.id
                        : key;
                    const officeName =
                      typeof office === "object" && office !== null
                        ? office.officename || office.office_name
                        : office;
                    return (
                      <option key={key} value={officeId}>
                        {officeName}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Multiple Office Access */}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Multiple Office Access
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                  {Object.entries(offices).map(([key, office]) => {
                    const officeId =
                      typeof office === "object" && office !== null
                        ? office.id
                        : key;
                    const officeName =
                      typeof office === "object" && office !== null
                        ? office.officename || office.office_name
                        : office;
                    const selectedIds = supervisorFormData.multi_officeid
                      ? String(supervisorFormData.multi_officeid).split(",")
                      : [];
                    const isChecked = selectedIds.includes(String(officeId));

                    return (
                      <label
                        key={key}
                        className="flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-blue-50"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            let updated = [...selectedIds];
                            if (e.target.checked) {
                              if (!updated.includes(String(officeId))) {
                                updated.push(String(officeId));
                              }
                            } else {
                              updated = updated.filter(
                                (id) => id !== String(officeId),
                              );
                            }
                            handleSupervisorChange(
                              "multi_officeid",
                              updated.join(","),
                            );
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-slate-700">
                          {officeName}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddSupervisorModal(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddSupervisor}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: HEADER_BLUE }}
              >
                Add Supervisor
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default ManageAdminPage;
