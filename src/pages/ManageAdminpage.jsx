import { useCallback, useEffect, useMemo, useState } from "react";
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
import { FaFilter, FaTimes } from "react-icons/fa";

const HEADER_BLUE = "#1547bd";

// Essential columns only for clean UI
const ESSENTIAL_COLUMNS = [
  { key: "employeeid", label: "Employee ID", minW: "min-w-[100px]" },
  { key: "admin_name", label: "Admin Name", minW: "min-w-[130px]" },
  { key: "email", label: "Email", minW: "min-w-[140px]" },
  { key: "phone", label: "Phone", minW: "min-w-[90px]" },
  { key: "officeid", label: "Office ID", minW: "min-w-[80px]" },
  // { key: "multi_officeid", label: "Multi Office", minW: "min-w-[90px]" },
];

// All columns for detail view
const ALL_COLUMNS = [
  { key: "admin_name", label: "Admin Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "officeid", label: "Office ID" },
  // { key: "multi_officeid", label: "Multiple Office" },
  { key: "city", label: "City" },
  { key: "address", label: "Address" },
  // { key: "lat", label: "Latitude" },
  // { key: "lon", label: "Longitude" },
  { key: "type", label: "Type" },
  { key: "position", label: "Position" },
  { key: "station_type", label: "Station Type" },
  { key: "deviceid", label: "Device ID" },
  // { key: "active_status", label: "Active Status" },
];

//All columns for edit view
const EDITABLE_COLUMNS = [
  // { key: "id", label: "ID" },
  { key: "employeeid", label: "Employee ID" },
  { key: "admin_name", label: "Admin Name" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "admin_password", label: "Password" },
  { key: "officeid", label: "Office ID" },
  // { key: "multi_officeid", label: "Multiple Office" },
  { key: "city", label: "City" },
  { key: "address", label: "Address" },
  { key: "lat", label: "Latitude" },
  { key: "lon", label: "Longitude" },
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
  const keys = [...ALL_COLUMNS.map((c) => c.key), "email"];
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

  // const userType = useSelector((state) => state.auth.user?.type);
  const auth = useSelector((state) => state.auth);
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
  // Change this line:
  const [employeesNotSupervisor, setEmployeesNotSupervisor] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [supervisorFormData, setSupervisorFormData] = useState({
    admin_name: "",
    email: "",
    phone: "",
    admin_password: "",
    officeid: "",
    city: "",
    address: "",
    // lat: editFormData.lat || "",
    // lon: editFormData.lon || "",
    // type: editFormData.type || "",
    // position: editFormData.position || "",
    // station_type: editFormData.station_type || "",
  });

  const [activeFilter, setActiveFilter] = useState(null);

  const [filters, setFilters] = useState({
    employeeid: "",
    admin_name: "",
    email: "",
    phone: "",
    officeid: "",
    active_status: "",
  });
  const [officeSearch, setOfficeSearch] = useState("");
  const filteredOffices = useMemo(() => {
    return Object.entries(offices).filter(([key, office]) => {
      const officeName =
        typeof office === "object" && office !== null
          ? office.officename || office.office_name
          : office;

      return officeName?.toLowerCase().includes(officeSearch.toLowerCase());
    });
  }, [offices, officeSearch]);

  // Add debounce hook
  function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  }

  // In component:
  const debouncedEmployeeSearch = useDebounce(employeeSearch, 300);

  const fetchemployeenotadmin = useCallback(async () => {
    if (!auth.token) return;

    try {
      const res = await axios.get(
        "https://namami-infotech.com/MMSalary/Admin/get_employe_notsupervisor.php",
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        },
      );

      let employeeList = [];
      if (Array.isArray(res.data)) {
        employeeList = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        employeeList = res.data.data;
      } else if (res.data?.employees && Array.isArray(res.data.employees)) {
        employeeList = res.data.employees;
      } else {
        employeeList = [];
      }

      setEmployeesNotSupervisor(employeeList);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployeesNotSupervisor([]);
    }
  }, [auth.token]);

  useEffect(() => {
    fetchemployeenotadmin();
  }, []);

  useEffect(() => {
    dispatch(fetchAllAdminsThunk());
    dispatch(fetchOfficesThunk());
    // dispatch(fetchEmployeesThunk());
  }, [dispatch]);

  const toggleFilter = (field) => {
    setActiveFilter(activeFilter === field ? null : field);
  };

  const handleInputChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Filter employees based on search
  const filteredEmployees = useMemo(() => {
    if (
      !debouncedEmployeeSearch.trim() ||
      !Array.isArray(employeesNotSupervisor) ||
      employeesNotSupervisor.length === 0
    ) {
      return [];
    }

    const searchTerm = debouncedEmployeeSearch.toLowerCase().trim();
    const results = [];
    const len = employeesNotSupervisor.length;

    for (let i = 0; i < len; i++) {
      const emp = employeesNotSupervisor[i];
      if (
        (emp.name?.toLowerCase() || "").includes(searchTerm) ||
        (emp.employeeid?.toLowerCase() || "").includes(searchTerm) ||
        (emp.email?.toLowerCase() || "").includes(searchTerm) ||
        (emp.phone?.toLowerCase() || "").includes(searchTerm)
      ) {
        results.push(emp);
      }

      if (results.length >= 50) break;
    }

    return results;
  }, [employeesNotSupervisor, debouncedEmployeeSearch]);

  const filteredRows = useMemo(() => {
    return items.filter((row) => {
      // Top Search
      const quickMatch =
        !quickFilter ||
        Object.values(row).some((v) =>
          String(v ?? "")
            .toLowerCase()
            .includes(quickFilter.toLowerCase()),
        );

      // Column Filters
      const columnMatch = Object.keys(filters).every((key) => {
        if (!filters[key]) return true;

        const rowValue = String(row[key] || "").toLowerCase();

        return rowValue.includes(filters[key].toLowerCase());
      });

      return quickMatch && columnMatch;
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

  // Open detail view modal
  const openDetailView = (row) => {
    setDetailRow(row);
    setDetailModalOpen(true);
  };

  const openEditModal = (row) => {
    setEditRow(row);

    const officeNames = row.officeid
      ? String(row.officeid)
          .split(",")
          .map((v) => v.trim()) // already names from backend OR fix later
      : [];

    const formData = {
      ...row,
      officeid: officeNames.join(","), // ONLY names stored
    };

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
      admin_name: "",
      email: "",
      phone: "",
      admin_password: "",
      officeid: "",
      multi_officeid: "",
      city: "",
      address: "",
    });
    setShowAddSupervisorModal(true);
    setModalError(null);
  };

  const selectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setEmployeeSearch(employee.name);
    setShowDropdown(false);

    // Convert employee's office data to office names
    let officeNames = "";
    if (employee.officeid) {
      const officeIds = String(employee.officeid).split(",");
      const names = officeIds.map((id) => {
        for (const [key, office] of Object.entries(offices)) {
          const officeId =
            typeof office === "object" && office !== null ? office.id : key;
          if (String(officeId) === String(id.trim())) {
            return typeof office === "object" && office !== null
              ? office.officename || office.office_name || id
              : office;
          }
        }
        return id;
      });
      officeNames = names.join(",");
    }

    setSupervisorFormData({
      admin_name: employee.name || "",
      email: employee.email || "",
      phone: employee.phone || "",
      admin_password: "",
      officeid: officeNames, // Only officeid field
      city: employee.city || "",
      address: employee.address || "",
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

    try {
      // const token = user

      // CLEAN PAYLOAD
      const payload = {
        id: editRow.id,
        admin_name: editFormData.admin_name || "",
        email: editFormData.email || "",
        phone: editFormData.phone || "",
        admin_password: editFormData.admin_password || "",
        officeid: editFormData.officeid || "",
        city: editFormData.city || "",
        address: editFormData.address || "",
        lat: editFormData.lat || "",
        lon: editFormData.lon || "",
        type: editFormData.type || "",
        position: editFormData.position || "",
        station_type: editFormData.station_type || "",
      };
      if (payload.officeid) {
        payload.officeid = String(payload.officeid)
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
          // remove numeric ids like 0,1,2 safely
          .filter((v) => isNaN(v))
          .join(",");
      }

      // console.log("FINAL PAYLOAD:", payload);

      const response = await axios.post(
        "https://namami-infotech.com/MMSalary/Admin/update_admin_details.php",
        payload,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        },
      );

      // console.log("UPDATE RESPONSE:", response.data);

      if (response.data.status || response.data.success) {
        await dispatch(fetchAllAdminsThunk());

        closeEditModal();

        setBanner({
          type: "success",
          text: response.data.message || "Admin updated successfully",
        });

        setTimeout(() => {
          setBanner(null);
        }, 3000);
      } else {
        throw new Error(response.data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);

      setModalError(
        err.response?.data?.message || err.message || "Failed to update admin",
      );
    }
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
      admin_name: supervisorFormData.admin_name || selectedEmployee.name,
      email: supervisorFormData.email || selectedEmployee.email,
      phone: supervisorFormData.phone || selectedEmployee.phone,
      admin_password: supervisorFormData.admin_password,
      officeid: supervisorFormData.officeid || "",
      city: supervisorFormData.city || "",
      address: supervisorFormData.address || "",
    };

    // console.log("Adding supervisor with payload:", payload);

    try {
      await dispatch(createSupervisorThunk(payload)).unwrap();
      await dispatch(fetchAllAdminsThunk());
      await fetchemployeenotadmin(); // Refresh employee list

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

  const renderHeader = (label, field, minW = "") => (
    <th
      className={`px-2 py-2 text-left font-semibold whitespace-nowrap border-b border-white/20 relative ${minW}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span>{label}</span>

        <button
          onClick={() => toggleFilter(field)}
          className="hover:text-gray-300 transition-colors"
        >
          {activeFilter === field ? (
            <FaTimes size={12} />
          ) : (
            <FaFilter size={12} />
          )}
        </button>
      </div>

      {activeFilter === field && (
        <div className="absolute top-full left-0 mt-1 w-full px-1 z-20">
          <input
            type="text"
            placeholder={`Search ${label}`}
            value={filters[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full rounded border border-gray-300 px-2 py-1 text-xs text-black shadow-lg outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
      )}
    </th>
  );

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
                    {ESSENTIAL_COLUMNS.map((col) =>
                      renderHeader(col.label, col.key, col.minW),
                    )}
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
                  {pageRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="py-8 text-center text-sm text-slate-500"
                      >
                        No admins found.
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((row, idx) => {
                      const globalIndex =
                        (currentPage - 1) * pageSize + idx + 1;
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
                    })
                  )}
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
                <select
                  value={currentPage}
                  onChange={(e) => setPage(Number(e.target.value))}
                  className="rounded-md border border-white/30
                bg-white/10
                px-3 py-1.5
                text-xs font-medium
                text-white
                outline-none
                backdrop-blur-sm
                transition-all
                hover:bg-white/20
                focus:border-white
                focus:ring-2
                focus:ring-white/30
                cursor-pointer
                "
                >
                  {Array.from({ length: totalPages }, (_, i) => (
                    <option key={i + 1} value={i + 1} className="text-black">
                      Page {i + 1}
                    </option>
                  ))}
                </select>
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
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2
                  id="edit-admin-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Edit Admin: {editRow?.admin_name || "N/A"}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Admin ID: {editRow?.id || "N/A"}
                </p>
              </div>
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {EDITABLE_COLUMNS.map((col) => {
                const isTextarea = col.key === "address";
                const isMultiSelect = col.key === "officeid";
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
                        {/* Selected Chips (NAMES ONLY) */}
                        {value &&
                          String(value).split(",").filter(Boolean).length >
                            0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {String(value)
                                .split(",")
                                .filter(Boolean)
                                .map((officeName) => (
                                  <div
                                    key={officeName}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-gradient-to-r from-[#1547bd]/10 to-[#1e5ad1]/10 text-[#1547bd] border border-[#1547bd]/20"
                                  >
                                    <span className="font-medium">
                                      {officeName}
                                    </span>

                                    <button
                                      type="button"
                                      className="ml-1 hover:text-red-600 text-[#1547bd] font-bold"
                                      onClick={() => {
                                        const newNames = String(value)
                                          .split(",")
                                          .filter((name) => name !== officeName)
                                          .join(",");

                                        setEditFormData({
                                          ...editFormData,
                                          [col.key]: newNames,
                                        });
                                      }}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                            </div>
                          )}

                        {/* Dropdown */}
                        <button
                          type="button"
                          onClick={() => setMultiSelectOpen(!multiSelectOpen)}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-left text-sm bg-white text-slate-700 hover:bg-slate-50 flex justify-between items-center"
                        >
                          <span>
                            {value &&
                            String(value).split(",").filter(Boolean).length > 0
                              ? `${String(value).split(",").filter(Boolean).length} office(s) selected`
                              : "Select Offices"}
                          </span>
                          <span className="text-slate-400">▼</span>
                        </button>

                        {/* Dropdown */}
                        {multiSelectOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                            <div className="p-2 border-b flex justify-between">
                              <span className="text-xs font-semibold text-slate-500">
                                Select Offices
                              </span>
                              <button
                                onClick={() => setMultiSelectOpen(false)}
                                className="text-xs text-slate-400"
                              >
                                Done
                              </button>
                            </div>

                            <div className="p-2 space-y-1">
                              {Object.entries(offices).map(([key, office]) => {
                                const officeName =
                                  typeof office === "object"
                                    ? office.officename || office.office_name
                                    : office;

                                const selectedNames = value
                                  ? String(value)
                                      .split(",")
                                      .map((v) => v.trim())
                                  : [];

                                const isSelected =
                                  selectedNames.includes(officeName);

                                return (
                                  <label
                                    key={key}
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                                      isSelected
                                        ? "bg-blue-50 border border-blue-200"
                                        : "hover:bg-slate-50"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={(e) => {
                                        let updated = selectedNames;

                                        if (e.target.checked) {
                                          if (!updated.includes(officeName)) {
                                            updated.push(officeName);
                                          }
                                        } else {
                                          updated = updated.filter(
                                            (name) => name !== officeName,
                                          );
                                        }

                                        setEditFormData({
                                          ...editFormData,
                                          [col.key]: updated.join(","),
                                        });
                                      }}
                                    />

                                    <span className="text-sm">
                                      {officeName}
                                    </span>
                                  </label>
                                );
                              })}
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
                        rows="3"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1547bd]/30"
                      />
                    ) : (
                      <input
                        type={col.key === "admin_password" ? "text" : "text"}
                        value={value}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            [col.key]: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1547bd]/30"
                        placeholder={`Enter ${col.label.toLowerCase()}`}
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

              {/* Admin Name - Auto-filled */}
              {/* <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Admin Name
                </label>
                <input
                  type="text"
                  value={supervisorFormData.admin_name}
                  onChange={(e) =>
                    handleSupervisorChange("admin_name", e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/30"
                  placeholder="Admin Name"
                />
              </div> */}

              {/* Email Field - Auto-filled */}
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

              {/* Phone Field - Auto-filled */}
              {/* <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={supervisorFormData.phone}
                  onChange={(e) =>
                    handleSupervisorChange("phone", e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/30"
                  placeholder="Phone Number"
                />
              </div> */}

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

              {/* City Field */}
              {/* <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  City
                </label>
                <input
                  type="text"
                  value={supervisorFormData.city}
                  onChange={(e) =>
                    handleSupervisorChange("city", e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/30"
                  placeholder="City"
                />
              </div> */}

              {/* Address Field */}
              {/* <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Address
                </label>
                <textarea
                  value={supervisorFormData.address}
                  onChange={(e) =>
                    handleSupervisorChange("address", e.target.value)
                  }
                  rows="2"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/30"
                  placeholder="Address"
                />
              </div> */}

              {/* Office Access Section - Only officeid field */}
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Office Access
                  </label>

                  <div className="relative w-64">
                    <FiSearch
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={14}
                    />

                    <input
                      type="text"
                      placeholder="Search office..."
                      value={officeSearch}
                      onChange={(e) => setOfficeSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1547bd]"
                    />
                  </div>
                </div>

                {/* Selected Chips Display */}
                {supervisorFormData.officeid &&
                  String(supervisorFormData.officeid).split(",").filter(Boolean)
                    .length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {String(supervisorFormData.officeid)
                        .split(",")
                        .filter(Boolean)
                        .map((officeName) => {
                          // Find full office name if it's an ID
                          let displayName = officeName;
                          for (const [key, office] of Object.entries(offices)) {
                            const officeId =
                              typeof office === "object" && office !== null
                                ? office.id
                                : key;
                            const name =
                              typeof office === "object" && office !== null
                                ? office.officename || office.office_name
                                : office;
                            if (
                              String(officeId) === String(officeName) ||
                              String(name) === String(officeName)
                            ) {
                              displayName = name;
                              break;
                            }
                          }
                          return (
                            <div
                              key={officeName}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs bg-gradient-to-r from-[#1547bd]/10 to-[#1e5ad1]/10 text-[#1547bd] border border-[#1547bd]/20"
                            >
                              <span className="font-medium">{displayName}</span>
                              <button
                                type="button"
                                className="ml-1 hover:text-red-600 text-[#1547bd] font-bold"
                                onClick={() => {
                                  const newIds = String(
                                    supervisorFormData.officeid,
                                  )
                                    .split(",")
                                    .filter(
                                      (id) =>
                                        id.trim() !== officeName &&
                                        id.trim() !== displayName,
                                    )
                                    .join(",");
                                  handleSupervisorChange("officeid", newIds);
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  )}

                {/* Office Checkbox Grid - Stores names, not IDs */}
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-lg bg-slate-50">
                  {/* {Object.entries(offices).map(([key, office]) => { */}
                  {filteredOffices.map(([key, office]) => {
                    const officeName =
                      typeof office === "object" && office !== null
                        ? office.officename || office.office_name
                        : office;

                    const selectedNames = supervisorFormData.officeid
                      ? String(supervisorFormData.officeid)
                          .split(",")
                          .map((n) => n.trim())
                      : [];
                    const isChecked = selectedNames.includes(officeName);

                    return (
                      <label
                        key={key}
                        className="flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-blue-50"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            let updated = [...selectedNames];
                            if (e.target.checked) {
                              if (!updated.includes(officeName)) {
                                updated.push(officeName);
                              }
                            } else {
                              updated = updated.filter(
                                (name) => name !== officeName,
                              );
                            }
                            handleSupervisorChange(
                              "officeid",
                              updated.join(","),
                            );
                          }}
                          className="rounded w-4 h-4"
                        />
                        <span className="text-sm text-slate-700">
                          {officeName}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Select multiple offices as needed
                </p>
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
