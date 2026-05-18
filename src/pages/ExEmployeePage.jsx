import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageTitle from "../components/shared/PageTitle";
import {
  FiEye,
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
  FiClock,
} from "react-icons/fi";
import { fetchXEmployeesThunk } from "../store/slices/employeeSlice";
import { fetchOfficesThunk } from "../store/slices/officeSlice";
import { FaFilter, FaTimes } from "react-icons/fa";

const HEADER_BLUE = "#1547bd";
const HEADER_GRADIENT = "linear-gradient(135deg, #1547bd 0%, #1e5ad1 100%)";

// Essential columns for Ex Employees
const ESSENTIAL_COLUMNS = [
  { key: "employeeid", label: "Employee ID", minW: "min-w-[120px]" },
  { key: "name", label: "Name", minW: "min-w-[160px]" },
  { key: "phone", label: "Phone", minW: "min-w-[130px]" },
  { key: "employee_role", label: "Role", minW: "min-w-[120px]" },
  { key: "officeid", label: "Office ID", minW: "min-w-[120px]" },
  { key: "last_working_day", label: "Exit Date", minW: "min-w-[120px]" },
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
  { key: "time", label: "Joining Date", type: "text", icon: FiCalendar },
  { key: "last_working_day", label: "Exit Date", type: "text", icon: FiClock },
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

function exportCsv(rows, columns, suffix = "ex-employees") {
  if (!rows.length) return;

  const keys = columns.map((c) => c.key);
  const header = columns.map((c) => c.label).join(",");

  const body = rows
    .map((r) =>
      keys
        .map((k) => {
          let value = r[k] ?? "";
          if (["aadhar_number", "account_num", "phone"].includes(k))
            value = `="${value}"`;
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(","),
    )
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

function ExEmployeePage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.employees);
  const userType = useSelector((state) => state.auth.user?.type);
  //   const { items: officeItems } = useSelector((state) => state.offices);

  const [quickFilter, setQuickFilter] = useState("");
  const [density, setDensity] = useState("normal");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  //   const [hoveredImage, setHoveredImage] = useState(null);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filters, setFilters] = useState({
    employeeid: "",
    name: "",
    phone: "",
    employee_role: "",
    officeid: "",
    last_working_day: "",
  });

  useEffect(() => {
    dispatch(fetchOfficesThunk());
    dispatch(fetchXEmployeesThunk());
  }, [dispatch]);

  const filteredRows = useMemo(() => {
    return items.filter((emp) => {
      const matchesQuickFilter =
        !quickFilter.trim() ||
        Object.values(emp).some(
          (val) =>
            val &&
            String(val)
              .toLowerCase()
              .includes(quickFilter.toLowerCase().trim()),
        );

      const matchesColumnFilters = Object.keys(filters).every((key) => {
        if (!filters[key]) return true;
        const empValue = String(emp[key] || "").toLowerCase();
        const filterValue = String(filters[key]).toLowerCase();
        return empValue.includes(filterValue);
      });

      return matchesQuickFilter && matchesColumnFilters;
    });
  }, [items, quickFilter, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const pageRows = filteredRows.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const cellPad = density === "compact" ? "px-2 py-1.5" : "px-3 py-2.5";
  const textSize = density === "compact" ? "text-xs" : "text-sm";

  const toggleFilter = (field) =>
    setActiveFilter(activeFilter === field ? null : field);
  const handleInputChange = (field, value) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  const openDetailView = (row) => {
    setDetailRow(row);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setDetailRow(null);
    // setHoveredImage(null);
  };

  const getFullImageUrl = (path) => {
    if (!path || path === "None") return null;
    if (path.startsWith("http")) return path;
    return `https://namami-infotech.com/MMSalary/uploads/${path}`;
  };

  const EXPORT_COLUMNS = [
    { key: "employeeid", label: "Employee ID" },
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "officeid", label: "Office ID" },
    { key: "employee_role", label: "Designation" },
    { key: "last_working_day", label: "Exit Date" },
    { key: "fathers_name", label: "Father Name" },
    { key: "dob", label: "DOB" },
    { key: "time", label: "Joining Date" },
    { key: "location", label: "Location" },
    { key: "address", label: "Address" },
    { key: "pin_code", label: "Pincode" },
    { key: "district", label: "District" },
    { key: "state", label: "State" },
    { key: "aadhar_number", label: "Aadhar Number" },
    { key: "pan_card", label: "PAN Number" },
    { key: "driving_license_no", label: "DL Number" },
    { key: "rc_number", label: "RC Number" },
    { key: "ac_name", label: "Account Name" },
    { key: "ifsc", label: "IFSC" },
    { key: "account_num", label: "Account Number" },
    ...(userType === "super" ? [{ key: "salary", label: "Salary" }] : []),
  ];

  return (
    <section className="flex flex-col overflow-hidden">
      <PageTitle
        title="Ex Employees"
        subtitle="View all employees who have left the organization."
      />

      <div
        className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-200"
        style={{ minHeight: "100vh" }}
      >
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-3 bg-white">
          <div className="flex-1" />

          <button
            type="button"
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50 transition-all duration-200 flex items-center gap-2"
            style={{ color: HEADER_BLUE }}
            onClick={() =>
              exportCsv(filteredRows, EXPORT_COLUMNS, "ex-employees")
            }
          >
            <FiDownload size={16} /> Export CSV
          </button>

          <div className="relative">
            <FiSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="search"
              placeholder="Search ex-employees..."
              value={quickFilter}
              onChange={(e) => {
                setQuickFilter(e.target.value);
                setPage(1);
              }}
              className="w-80 rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/20 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1547bd] mx-auto mb-4"></div>
              <p className="text-sm text-slate-500">Loading ex-employees...</p>
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
                        className={`${cellPad} text-left font-semibold whitespace-nowrap border-b border-white/20 ${col.minW} relative`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{col.label}</span>
                          <button
                            onClick={() => toggleFilter(col.key)}
                            className="hover:text-gray-300 transition-colors"
                          >
                            {activeFilter === col.key ? (
                              <FaTimes size={12} />
                            ) : (
                              <FaFilter size={12} />
                            )}
                          </button>
                        </div>
                        {activeFilter === col.key && (
                          <div className="absolute top-full left-0 mt-1 w-full px-2 z-20">
                            <input
                              type="text"
                              className="w-full p-1 text-sm text-black rounded border border-gray-300 shadow-lg outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={`Search ${col.label}...`}
                              value={filters[col.key] || ""}
                              onChange={(e) =>
                                handleInputChange(col.key, e.target.value)
                              }
                              autoFocus
                            />
                          </div>
                        )}
                      </th>
                    ))}
                    <th
                      className={`${cellPad} text-left font-semibold whitespace-nowrap border-b border-white/20 w-24`}
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {pageRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={ESSENTIAL_COLUMNS.length + 2}
                        className="py-10 text-center text-sm text-slate-500"
                      >
                        No ex-employees found.
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((row, idx) => {
                      const globalIndex =
                        (currentPage - 1) * pageSize + idx + 1;
                      const rk = getRowKey(row, idx);

                      return (
                        <tr
                          key={`${rk}-${globalIndex}`}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-all duration-150"
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
                              ) : col.key === "last_working_day" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                                  <FiClock size={12} />{" "}
                                  {cellValue(row, col.key)}
                                </span>
                              ) : (
                                cellValue(row, col.key)
                              )}
                            </td>
                          ))}
                          <td className={`${cellPad} whitespace-nowrap`}>
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 text-red-600 text-xs">
                              <FiUser size={12} /> Ex-Employee
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 bg-white">
              <span className="text-sm text-slate-600">
                {filteredRows.length === 0
                  ? "No rows"
                  : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(currentPage * pageSize, filteredRows.length)} of ${filteredRows.length} employees`}
              </span>
              <div className="flex items-center gap-3">
                <select
                  value={currentPage}
                  onChange={(e) => setPage(Number(e.target.value))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm outline-none transition-all cursor-pointer"
                >
                  {Array.from({ length: totalPages }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Page {i + 1}
                    </option>
                  ))}
                </select>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                >
                  <FiChevronLeft size={16} /> Prev
                </button>
                <span className="text-sm font-medium text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
                >
                  Next <FiChevronRight size={16} />
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
                    <p className="text-amber-200 text-sm mt-1 flex items-center gap-1">
                      <FiClock size={14} /> Exit Date:{" "}
                      {detailRow?.last_working_day || "—"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeDetailModal}
                  className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/20 transition-all"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6 bg-white">
              {/* Personal Information */}
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
                        "time",
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
                        className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-2 text-slate-500 mb-2">
                          {Icon && <Icon size={14} />}
                          <p className="text-xs font-medium uppercase tracking-wide">
                            {col.label}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-800">
                          {detailRow?.[col.key] || "—"}
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
                        "last_working_day",
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
                        className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all"
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
                                onClick={() => window.open(imageUrl, "_blank")}
                              />
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
    </section>
  );
}

export default ExEmployeePage;
