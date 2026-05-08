import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageTitle from "../components/shared/PageTitle";
import StatusToggle from "../components/shared/StatusToggle";
import {
  FiEye,
  FiEdit2,
  FiDownload,
  FiSearch,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiList,
  FiUser,
  FiMapPin,
  FiPhone,
  FiCalendar,
  FiFileText,
  FiImage,
  FiBriefcase,
  FiDollarSign,
  FiCreditCard,
  FiHome,
} from "react-icons/fi";
import {
  fetchEmployeesThunk,
  // updateEmployeeDetailsThunk,
  updateEmployeeStatusThunk,
} from "../store/slices/employeeSlice";
import { fetchOfficesThunk } from "../store/slices/officeSlice";
import axios from "axios";

const HEADER_BLUE = "#1547bd";
const HEADER_GRADIENT = "linear-gradient(135deg, #1547bd 0%, #1e5ad1 100%)";

// Essential columns only for clean UI
const ESSENTIAL_COLUMNS = [
  { key: "employeeid", label: "Employee ID", minW: "min-w-[120px]" },
  { key: "name", label: "Name", minW: "min-w-[160px]" },
  { key: "phone", label: "Phone", minW: "min-w-[130px]" },
  { key: "employee_role", label: "Role", minW: "min-w-[120px]" },
  { key: "officeid", label: "Office ID", minW: "min-w-[120px]" },
];

// All columns for detail view
const ALL_COLUMNS = [
  { key: "employeeid", label: "Employee ID", type: "text", icon: FiUser },
  { key: "photo", label: "Photo", type: "image", icon: FiImage },
  { key: "name", label: "Name", type: "text", icon: FiUser },
  { key: "phone", label: "Phone", type: "text", icon: FiPhone },
  { key: "officeid", label: "Office ID", type: "text", icon: FiMapPin },
  { key: "location", label: "Location", type: "text", icon: FiMapPin },
  { key: "employee_role", label: "Role", type: "text", icon: FiBriefcase },
  { key: "fathers_name", label: "Father Name", type: "text", icon: FiUser },
  { key: "dob", label: "DOB", type: "text", icon: FiCalendar },
  { key: "address", label: "Address", type: "text", icon: FiHome },
  { key: "district", label: "District", type: "text", icon: FiMapPin },
  { key: "state", label: "State", type: "text", icon: FiMapPin },
  { key: "pin_code", label: "Pincode", type: "text", icon: FiMapPin },
  {
    key: "aadhar_number",
    label: "Aadhar Number",
    type: "text",
    icon: FiFileText,
  },
  { key: "pan_card", label: "PAN Card", type: "text", icon: FiFileText },
  {
    key: "driving_license_no",
    label: "DL Number",
    type: "text",
    icon: FiFileText,
  },
  { key: "rc_number", label: "RC Number", type: "text", icon: FiFileText },
  { key: "ac_name", label: "Account Name", type: "text", icon: FiUser },
  { key: "ifsc", label: "IFSC", type: "text", icon: FiCreditCard },
  {
    key: "account_num",
    label: "Account Number",
    type: "text",
    icon: FiCreditCard,
  },
  { key: "salary", label: "Salary", type: "text", icon: FiDollarSign },
  { key: "aadhar_photo", label: "Aadhar", type: "image", icon: FiImage },
  { key: "pan_photo", label: "PAN", type: "image", icon: FiImage },
  { key: "rc_photo", label: "RC", type: "image", icon: FiImage },
  { key: "dl_photo", label: "DL", type: "image", icon: FiImage },
  { key: "passbook_photo", label: "Passbook", type: "image", icon: FiImage },
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
  const keys = [...ALL_COLUMNS.map((c) => c.key), "id"];
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
  const { items, loading, statusUpdateLoading } = useSelector(
    (state) => state.employees,
  );
  const userType = useSelector((state) => state.auth.user?.type);

  const [quickFilter, setQuickFilter] = useState("");
  const [density, setDensity] = useState("normal");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Detail View Modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [hoveredImage, setHoveredImage] = useState(null);

  const { items: officeItems } = useSelector((state) => state.offices);
  // Edit Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [files, setFiles] = useState({});

  const auth = useSelector((state) => state.auth);

  const [banner, setBanner] = useState(null);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    dispatch(fetchOfficesThunk());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchEmployeesThunk());
  }, [dispatch]);

  const filteredRows = useMemo(() => {
    if (!quickFilter.trim()) return items;
    const term = quickFilter.toLowerCase().trim();
    return items.filter((emp) =>
      Object.values(emp).some(
        (val) => val && String(val).toLowerCase().includes(term),
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

  const openDetailView = (row) => {
    setDetailRow(row);
    setDetailModalOpen(true);
  };

  const openEditModal = (row) => {
    // Parse officeid from comma-separated string to array
    let officeArray = [];

    if (row.officeid) {
      if (typeof row.officeid === "string") {
        officeArray = row.officeid.split(",").filter((id) => id.trim());
      } else if (Array.isArray(row.officeid)) {
        officeArray = [...row.officeid];
      }
    }

    setEditRow(row);
    setEditForm({
      ...row,
      officeid: officeArray, // Array mein store karo
      // primary_office ko remove karo ya optional rakho
    });
    setFiles({});
    setEditModalOpen(true);
    setModalError(null);
  };

  const handleEditChange = (key, value) => {
    setEditForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFileChange = (key, file) => {
    setFiles((prev) => ({
      ...prev,
      [key]: file,
    }));
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setDetailRow(null);
    setHoveredImage(null);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditRow(null);
    setFiles({});
  };

  const handleStatusToggle = async (employee) => {
    const employeeid = employee.employeeid;
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

      setTimeout(() => setBanner(null), 3000);

      dispatch(fetchEmployeesThunk());
    } catch (err) {
      setBanner({
        type: "error",
        text: err || "Failed to update status",
      });
      setTimeout(() => setBanner(null), 3000);
    }
  };

  const handleUpdate = async () => {
    const formData = new FormData();

    // console.log("=== EDIT FORM DATA ===");
    // console.log("editForm:", editForm);

    // 1. Employee ID (mandatory)
    formData.append("employeeid", editForm.employeeid);

    // 2. All text fields
    const excludeKeys = [
      "photo",
      "officeid",
      "multi_officeids",
      "primary_office",
    ];

    Object.keys(editForm).forEach((key) => {
      if (!excludeKeys.includes(key)) {
        if (
          editForm[key] !== null &&
          editForm[key] !== undefined &&
          editForm[key] !== ""
        ) {
          formData.append(key, editForm[key]);
          // console.log(`Appending ${key}:`, editForm[key]);
        }
      }
    });

    // 3. Officeid - Convert array to comma separated string
    if (editForm.officeid && Array.isArray(editForm.officeid)) {
      const officeidString = editForm.officeid.join(",");
      formData.append("officeid", officeidString);
      // console.log("Appending officeid string:", officeidString);
    } else if (typeof editForm.officeid === "string") {
      formData.append("officeid", editForm.officeid);
      // console.log("Appending officeid string:", editForm.officeid);
    }

    // 4. Files upload
    Object.keys(files).forEach((key) => {
      if (files[key]) {
        formData.append(key, files[key]);
        // console.log(`Appending file ${key}:`, files[key].name);
      }
    });

    // // Debug: Log all FormData entries
    // console.log("=== FINAL FORMDATA ENTRIES ===");
    // for (let pair of formData.entries()) {
    //   console.log(pair[0] + ":", pair[1]);
    // }

    try {
      // const result = await dispatch(updateEmployeeDetailsThunk(formData)).unwrap();
      // console.log("SUCCESS Response:", result);
      const result = await axios.post(
        `https://namami-infotech.com/MMSalary/Employee/update_employee.php`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        },
      );
      setBanner({
        type: "success",
        text: "Employee updated successfully",
      });

      setTimeout(() => setBanner(null), 3000);
      dispatch(fetchEmployeesThunk());
      closeEditModal();
    } catch (err) {
      console.error("ERROR Full object:", err);
      console.error("ERROR Message:", err.message);
      console.error("ERROR Response:", err.response?.data);
      console.error("ERROR Status:", err.response?.status);

      // Show detailed error message
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update employee";
      setModalError(errorMsg);
    }
  };

  const getFullImageUrl = (path) => {
    if (!path || path === "None") return null;
    if (path.startsWith("http")) return path;
    return `https://namami-infotech.com/MMSalary/uploads/${path}`;
  };

  return (
    <section className="flex flex-col overflow-hidden">
      <PageTitle
        title="Manage Employees"
        subtitle="Full directory management. Search, filter, view details, and edit employee information."
      />

      {/* Banner Alert */}
      {banner && !editModalOpen && !detailModalOpen && (
        <div
          className={`rounded-xl px-5 py-3 text-sm font-medium shadow-lg transform transition-all duration-300 ${
            banner.type === "success"
              ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
              : "bg-gradient-to-r from-rose-500 to-red-500 text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            {banner.type === "success" ? "✓" : "⚠"}
            {banner.text}
          </div>
        </div>
      )}

      {/* Main Card */}
      <div
        className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-200"
        style={{ minHeight: "100vh" }}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-3 bg-white">
          <button
            type="button"
            onClick={() => {
              setQuickFilter("");
              setPage(1);
            }}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 flex items-center gap-2 bg-gradient-to-r from-[#1547bd] to-[#1e5ad1] text-white shadow-md"
          >
            <FiList size={16} />
            All Employees
          </button>

          <div className="flex-1" />

          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
            style={{ color: HEADER_BLUE }}
            onClick={() => exportCsv(filteredRows, "employees")}
          >
            <FiDownload size={16} />
            Export CSV
          </button>

          <div className="relative">
            <FiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="search"
              placeholder="Search employees..."
              value={quickFilter}
              onChange={(e) => {
                setQuickFilter(e.target.value);
                setPage(1);
              }}
              className="w-80 rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1547bd] mx-auto mb-4"></div>
              <p className="text-sm text-slate-500">Loading employees...</p>
            </div>
          </div>
        ) : pageRows.length === 0 ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <FiUser size={48} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm text-slate-500">No employees found.</p>
              {quickFilter && (
                <button
                  onClick={() => setQuickFilter("")}
                  className="mt-2 text-sm text-[#1547bd] hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-x-auto overflow-y-auto">
              <table className={`w-full border-collapse ${textSize}`}>
                <thead className="sticky top-0 z-[1] shadow-sm">
                  <tr style={{ background: HEADER_GRADIENT, color: "#fff" }}>
                    <th
                      className={`${cellPad} text-left font-semibold whitespace-nowrap border-b border-white/20 w-12`}
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
                      className={`${cellPad} text-left font-semibold whitespace-nowrap border-b border-white/20 w-24`}
                    >
                      Status
                    </th>
                    <th
                      className={`${cellPad} text-left font-semibold whitespace-nowrap border-b border-white/20 w-24`}
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
                        className={`border-b border-slate-100 transition-all duration-150 ${
                          isActive
                            ? "hover:bg-slate-50"
                            : "bg-slate-50/40 hover:bg-slate-50/60"
                        }`}
                      >
                        <td
                          className={`${cellPad} text-center whitespace-nowrap`}
                        >
                          <button
                            onClick={() => openDetailView(row)}
                            className="rounded-lg p-2 text-sm transition-all duration-200 hover:bg-blue-100 hover:scale-105"
                            style={{ color: HEADER_BLUE }}
                            title="View employee details"
                          >
                            <FiEye size={18} />
                          </button>
                        </td>
                        {ESSENTIAL_COLUMNS.map((col) => (
                          <td
                            key={col.key}
                            className={`${cellPad} text-slate-700 whitespace-nowrap max-w-[220px] truncate`}
                            title={cellValue(row, col.key)}
                          >
                            {col.key === "name" ? (
                              <div className="flex items-center gap-2">
                                {row.photo && (
                                  <img
                                    src={getFullImageUrl(row.photo)}
                                    className="w-7 h-7 rounded-full object-cover"
                                  />
                                )}
                                <span className="font-medium">
                                  {cellValue(row, col.key)}
                                </span>
                              </div>
                            ) : (
                              cellValue(row, col.key)
                            )}
                          </td>
                        ))}
                        <td className={`${cellPad} whitespace-nowrap`}>
                          <StatusToggle
                            isActive={isActive}
                            onToggle={() => handleStatusToggle(row)}
                            disabled={statusUpdateLoading}
                            loading={statusUpdateLoading}
                          />
                        </td>
                        <td className={`${cellPad} whitespace-nowrap`}>
                          <button
                            onClick={() => openEditModal(row)}
                            className="rounded-lg p-2 text-sm transition-all duration-200 hover:bg-blue-100 hover:scale-105"
                            style={{ color: HEADER_BLUE }}
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

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 bg-white">
              <span className="text-sm text-slate-600">
                {filteredRows.length === 0
                  ? "No rows"
                  : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(
                      currentPage * pageSize,
                      filteredRows.length,
                    )} of ${filteredRows.length} employees`}
              </span>
              <div className="flex items-center gap-3">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all duration-200"
                >
                  <FiChevronLeft size={16} />
                  Prev
                </button>
                <span className="text-sm font-medium text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all duration-200"
                >
                  Next
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {detailModalOpen && detailRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
            <div className="relative bg-gradient-to-r from-[#1547bd] to-[#1e5ad1] text-white p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  {detailRow?.photo && (
                    <img
                      src={getFullImageUrl(detailRow.photo)}
                      className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
                      alt={detailRow.name}
                    />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">{detailRow?.name}</h2>
                    <p className="text-blue-100 mt-1">
                      {detailRow?.employeeid}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeDetailModal}
                  className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6 bg-white">
              {/* Personal Information Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#1547bd] to-[#1e5ad1] rounded-full"></div>
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ALL_COLUMNS.filter(
                    (col) =>
                      col.type === "text" &&
                      [
                        "name",
                        "phone",
                        "officeid",
                        "location",
                        "employee_role",
                        "fathers_name",
                        "dob",
                        "address",
                        "district",
                        "state",
                        "pin_code",
                      ].includes(col.key),
                  ).map((col) => {
                    const Icon = col.icon;
                    return (
                      <div
                        key={col.key}
                        className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-2 text-slate-500 mb-2">
                          {Icon && <Icon size={14} />}
                          <p className="text-xs font-medium uppercase tracking-wide">
                            {col.label}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">
                          {col.key === "salary"
                            ? `₹${detailRow?.[col.key] || "—"}`
                            : detailRow?.[col.key] || "—"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Employment Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#1547bd] to-[#1e5ad1] rounded-full"></div>
                  Employment Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ALL_COLUMNS.filter(
                    (col) =>
                      col.type === "text" &&
                      [
                        // "salary",
                        ...(userType === "super" ? ["salary"] : []),
                        "aadhar_number",
                        "pan_card",
                        "driving_license_no",
                        "rc_number",
                        "ac_name",
                        "account_num",
                        "ifsc",
                      ].includes(col.key),
                  ).map((col) => {
                    const Icon = col.icon;
                    return (
                      <div
                        key={col.key}
                        className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center gap-2 text-slate-500 mb-2">
                          {Icon && <Icon size={14} />}
                          <p className="text-xs font-medium uppercase tracking-wide">
                            {col.label}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">
                          {col.key === "salary"
                            ? `₹${detailRow?.[col.key] || "—"}`
                            : detailRow?.[col.key] || "—"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Documents Section */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-[#1547bd] to-[#1e5ad1] rounded-full"></div>
                  Documents
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {ALL_COLUMNS.filter((col) => col.type === "image").map(
                    (col) => {
                      const imageUrl = getFullImageUrl(detailRow?.[col.key]);
                      return (
                        <div
                          key={col.key}
                          className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 text-center relative"
                          onMouseEnter={() => setHoveredImage(col.key)}
                          onMouseLeave={() => setHoveredImage(null)}
                        >
                          <p className="text-xs font-medium text-slate-600 mb-2">
                            {col.label}
                          </p>
                          {imageUrl ? (
                            <div className="relative group cursor-pointer overflow-hidden rounded-lg">
                              <img
                                src={imageUrl}
                                alt={col.label}
                                className="h-32 w-full object-cover rounded-lg transition-transform duration-300"
                              />
                              {hoveredImage === col.key && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                                  <img
                                    src={imageUrl}
                                    alt={col.label}
                                    className="max-w-full max-h-full object-contain p-2"
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
                              <p className="text-xs text-slate-400">
                                No Document
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal with Blue Theme */}
      {editModalOpen && editRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col">
            <div className="bg-gradient-to-r from-[#1547bd] to-[#1e5ad1] text-white p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Edit Employee</h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {editRow?.name} • {editRow?.employeeid}
                  </p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/20 transition-all duration-200"
                >
                  <FiX size={22} />
                </button>
              </div>
            </div>

            {modalError && (
              <div className="mx-4 mt-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                {modalError}
              </div>
            )}

            <div className="overflow-y-auto p-5 bg-white">
              {/* Two Column Layout for Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Employee ID - Read Only */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Employee ID
                    </label>
                    <input
                      disabled
                      value={editForm?.employeeid || ""}
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 bg-slate-50 text-slate-500 text-sm"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editForm?.name || ""}
                      onChange={(e) => handleEditChange("name", e.target.value)}
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all text-sm"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editForm?.phone || ""}
                      onChange={(e) =>
                        handleEditChange("phone", e.target.value)
                      }
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all text-sm"
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Role
                    </label>
                    <input
                      type="text"
                      value={editForm?.employee_role || ""}
                      onChange={(e) =>
                        handleEditChange("employee_role", e.target.value)
                      }
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all text-sm"
                    />
                  </div>

                  {/* Father's Name */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Father's Name
                    </label>
                    <input
                      type="text"
                      value={editForm?.fathers_name || ""}
                      onChange={(e) =>
                        handleEditChange("fathers_name", e.target.value)
                      }
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all text-sm"
                    />
                  </div>

                  {/* DOB */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={editForm?.dob || ""}
                      onChange={(e) => handleEditChange("dob", e.target.value)}
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Location */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Location
                    </label>
                    <input
                      type="text"
                      value={editForm?.location || ""}
                      onChange={(e) =>
                        handleEditChange("location", e.target.value)
                      }
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all text-sm"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Address
                    </label>
                    <input
                      type="text"
                      value={editForm?.address || ""}
                      onChange={(e) =>
                        handleEditChange("address", e.target.value)
                      }
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all text-sm"
                    />
                  </div>

                  {/* District */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      District
                    </label>
                    <input
                      type="text"
                      value={editForm?.district || ""}
                      onChange={(e) =>
                        handleEditChange("district", e.target.value)
                      }
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all text-sm"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      State
                    </label>
                    <input
                      type="text"
                      value={editForm?.state || ""}
                      onChange={(e) =>
                        handleEditChange("state", e.target.value)
                      }
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all text-sm"
                    />
                  </div>

                  {/* Pin Code */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Pin Code
                    </label>
                    <input
                      type="text"
                      value={editForm?.pin_code || ""}
                      onChange={(e) =>
                        handleEditChange("pin_code", e.target.value)
                      }
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Multiple Office Access - Full Width with Primary Selection */}
              {/* Multiple Office Access - Full Width */}
              <div className="mt-5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">
                  Offices Access
                </label>

                {/* 1. Selected Chips Section */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {(editForm?.officeid || []).map((office) => {
                    // First office is primary
                    const isPrimary =
                      Array.isArray(editForm?.officeid) &&
                      editForm.officeid[0] === office;

                    return (
                      <div
                        key={office}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          isPrimary
                            ? "bg-gradient-to-r from-[#1547bd] to-[#1e5ad1] text-white shadow-sm"
                            : "bg-[#1547bd]/10 text-[#1547bd] border border-[#1547bd]/20"
                        }`}
                      >
                        <span className="whitespace-nowrap">
                          {office} {isPrimary && "(Primary)"}
                        </span>

                        {/* Delete Button */}
                        <button
                          type="button"
                          className="ml-1 hover:text-red-600 text-[#1547bd] font-bold transition-colors"
                          onClick={() => {
                            const updated = (editForm?.officeid || []).filter(
                              (id) => String(id) !== String(office),
                            );
                            handleEditChange("officeid", updated);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* 2. Checkbox List */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-3 border border-slate-200 rounded-lg bg-white">
                  {(officeItems || []).map((office) => {
                    const selectedOffices = editForm?.officeid || [];
                    const isChecked = selectedOffices.some(
                      (id) => String(id) === String(office),
                    );

                    const isPrimary =
                      selectedOffices.length > 0 &&
                      selectedOffices[0] === office;

                    return (
                      <label
                        key={office}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          isChecked && isPrimary
                            ? "bg-gradient-to-r from-[#1547bd]/15 to-[#1e5ad1]/15 border border-[#1547bd]/30"
                            : isChecked
                              ? "bg-[#1547bd]/5 border border-[#1547bd]/20"
                              : "hover:bg-[#1547bd]/5 border border-transparent"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            let updated = [...selectedOffices];
                            const officeStr = String(office);

                            if (e.target.checked) {
                              if (!updated.includes(officeStr)) {
                                updated.push(officeStr);
                              }
                            } else {
                              updated = updated.filter(
                                (id) => id !== officeStr,
                              );
                            }

                            handleEditChange("officeid", updated);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-[#1547bd] focus:ring-[#1547bd] focus:ring-2"
                        />
                        <span
                          className={`text-sm ${
                            isChecked && isPrimary
                              ? "font-semibold text-[#1547bd]"
                              : "text-slate-700"
                          }`}
                        >
                          {office}
                          {isChecked && isPrimary && " (Primary)"}
                        </span>
                      </label>
                    );
                  })}
                </div>

                <p className="text-xs text-slate-500 mt-2">
                  ✅ First selected office is automatically the primary office
                </p>
              </div>

              {/* Financial Information - Two Columns */}
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200">
                  Financial Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Salary
                    </label>
                    <input
                      type="number"
                      value={editForm?.salary || ""}
                      onChange={(e) =>
                        handleEditChange("salary", e.target.value)
                      }
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={editForm?.ac_name || ""}
                      onChange={(e) =>
                        handleEditChange("ac_name", e.target.value)
                      }
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={editForm?.ifsc || ""}
                      onChange={(e) => handleEditChange("ifsc", e.target.value)}
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={editForm?.account_num || ""}
                      onChange={(e) =>
                        handleEditChange("account_num", e.target.value)
                      }
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Document Numbers - Two Columns */}
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200">
                  Document Numbers
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Aadhar Number
                    </label>
                    <input
                      type="text"
                      value={editForm?.aadhar_number || ""}
                      onChange={(e) =>
                        handleEditChange("aadhar_number", e.target.value)
                      }
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      PAN Card
                    </label>
                    <input
                      type="text"
                      value={editForm?.pan_card || ""}
                      onChange={(e) =>
                        handleEditChange("pan_card", e.target.value)
                      }
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Driving License
                    </label>
                    <input
                      type="text"
                      value={editForm?.driving_license_no || ""}
                      onChange={(e) =>
                        handleEditChange("driving_license_no", e.target.value)
                      }
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      RC Number
                    </label>
                    <input
                      type="text"
                      value={editForm?.rc_number || ""}
                      onChange={(e) =>
                        handleEditChange("rc_number", e.target.value)
                      }
                      className="w-full mt-1 rounded-lg border border-slate-300 px-3 py-2 focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Document Upload - Simplified */}
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b border-slate-200">
                  Document Uploads (Optional)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {ALL_COLUMNS.filter((col) => col.type === "image").map(
                    (col) => (
                      <div
                        key={col.key}
                        className="bg-slate-50 rounded-lg p-2 border border-slate-200"
                      >
                        <label className="text-xs font-medium text-slate-600 block mb-1">
                          {col.label}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleFileChange(col.key, e.target.files[0])
                          }
                          className="w-full text-xs text-slate-500 file:mr-1 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-[#1547bd] hover:file:bg-blue-100"
                        />
                        {files[col.key] && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ Selected
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-slate-200 bg-white">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-all duration-200 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#1547bd] to-[#1e5ad1] text-white font-medium hover:shadow-lg transition-all duration-200 text-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default EmployeeListPage;
