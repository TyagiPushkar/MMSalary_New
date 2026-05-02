import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import PageTitle from "../components/shared/PageTitle";
import AddEmployeeFilters from "../components/addEmployee/AddEmployeeFilters";
import EmployeeDetailsModal from "../components/addEmployee/EmployeeDetailsModal";
import RegistrationModal from "../components/addEmployee/RegistrationModal";
import RequestEmployeesDataTable from "../components/addEmployee/RequestEmployeesDataTable";
import AddSalary from "../components/addEmployee/AddSalary";
import {
  ADD_EMPLOYEE_THEME,
  PAGE_SIZE,
} from "../components/addEmployee/addEmployeeTheme";
import {
  addEmployeeThunk,
  fetchRequestEmployeesThunk,
} from "../store/slices/employeeSlice";

const HEADER_BLUE = "#1547bd";

function AddEmployeePage() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const { requestItems, requestLoading, addLoading, addError } = useSelector(
    (state) => state.employees,
  );

  const [hiddenIds, setHiddenIds] = useState(() => new Set());
  const [searchName, setSearchName] = useState("");
  const [officeFilter, setOfficeFilter] = useState("");
  const [appliedFilter, setAppliedFilter] = useState({ name: "", office: "" });
  const [page, setPage] = useState(1);

  const [openRegistration, setOpenRegistration] = useState(false);
  const [openSalary, setOpenSalary] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [viewEmployee, setViewEmployee] = useState(null);
  const [banner, setBanner] = useState(null);

  const [regForm, setRegForm] = useState({
    name: "",
    phone: "",
    officeid: user.officeid || "",
    photo: user.photo || "",
    department: "",
    location: "",
    employee_role: "",
    father_name: "",
    dob: "",
    // Personal details
    address: "",
    district: "",
    state: "",
    pin_code: "",
    // Aadhar & PAN
    aadhar_number: "",
    pan_card: "",
    // DL & RC
    driving_license_no: "",
    rc_number: "",
    // Bank details
    ac_name: "",
    ifsc: "",
    account_num: "",
    // other
    // position: "",
  });

  const [addsalary, setaddsalary] = useState({
    salary: "",
    multi_officeids: [],
  });

  useEffect(() => {
    dispatch(fetchRequestEmployeesThunk());
  }, [dispatch]);

  const rowKey = (row) => row.id ?? row.employeeid;

  const baseRows = useMemo(
    () => requestItems.filter((row) => !hiddenIds.has(rowKey(row))),
    [requestItems, hiddenIds],
  );

  const officeOptions = useMemo(() => {
    const set = new Set();
    requestItems.forEach((row) => {
      if (row.officeid) set.add(String(row.officeid));
    });
    return [...set];
  }, [requestItems]);

  const handleSearch = () => {
    setAppliedFilter({
      name: searchName.toLowerCase(),
      office: officeFilter,
    });
    setPage(1);
  };

  const filteredData = useMemo(() => {
    return baseRows.filter((emp) => {
      const nameMatch =
        !appliedFilter.name ||
        (emp.name || "").toLowerCase().includes(appliedFilter.name);

      const officeMatch =
        !appliedFilter.office || String(emp.officeid) === appliedFilter.office;

      return nameMatch && officeMatch;
    });
  }, [baseRows, appliedFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const pageRows = filteredData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleDelete = (id) => {
    if (!id) return;
    setHiddenIds((prev) => new Set(prev).add(id));
  };

  const openRegistrationModal = (row) => {
    setSelectedEmployee(row);
    setRegForm({ ...row });
    setOpenRegistration(true);
  };

  const openSalaryModal = (row) => {
    setSelectedEmployee(row);
    setaddsalary({
      salary: "",
      multi_officeids: [],
    });
    setOpenSalary(true);
  };

  const handleRegChange = (e) => {
    const { name, value } = e.target;
    setRegForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    setaddsalary((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegSubmit = async (e, formData) => {
    e.preventDefault();
    if (!formData) {
      console.error("FormData missing!");
      return;
    }
    const obj = Object.fromEntries(formData.entries());
    // console.log("Submitting FormData:", [...formData.entries()]);

    // console.log("Converted Object:", obj);

    const res = await dispatch(
      addEmployeeThunk({
        payload: obj,
        token,
        user,
      }),
    );

    if (res.meta.requestStatus === "fulfilled") {
      await dispatch(fetchRequestEmployeesThunk());
      setOpenRegistration(false);
      setBanner({ type: "success", text: "Employee added successfully!" });
      setTimeout(() => setBanner(null), 5000);
    }
  };

  const handleSalarySubmit = async (e, payload) => {
    e.preventDefault();
    if (!payload || !payload.salary || !payload.multi_officeids) {
      setBanner({ type: "error", text: "Invalid salary data" });
      setTimeout(() => setBanner(null), 5000);
      return;
    }
    // console.log("2 process Submitting salary with payload:", payload);
    try {
      // Make API call to add salary using axios
      const result = await axios.post(
        `${import.meta.env.VITE_PHP_BASE_URL || "https://namami-infotech.com/MMSalary"}/Employee/add_salary.php`,
        {
          id: payload.employee_id,
          salary: payload.salary,
          multi_officeids: payload.multi_officeids, // Send as array
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (result.data.success || result.data.status === true) {
        //console.log("Salary added successfully:", result.data);
        setOpenSalary(false);
        setBanner({
          type: "success",
          text: "Salary added successfully!",
        });
        setaddsalary({ salary: "", multi_officeids: [] });
        setTimeout(() => setBanner(null), 5000);
      } else {
        // console.error("Failed to add salary:", result.data);
        setBanner({
          type: "error",
          text: result.data.message || "Failed to add salary",
        });
        setTimeout(() => setBanner(null), 5000);
      }
    } catch (error) {
      console.error("Salary submission error:", error);
      setBanner({
        type: "error",
        text: "Error submitting salary: " + error.message,
      });
      setTimeout(() => setBanner(null), 5000);
    }
  };

  const isSuper = user?.type === "super";

  return (
    <section className="flex flex-col gap-4 overflow-hidden">
      <PageTitle
        title="Register New Employees"
        subtitle="Review pending employee registrations, view details, and add them to the system."
      />

      {banner && !openViewModal && !openRegistration ? (
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
        {/* Toolbar with Filters */}
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label
                htmlFor="search-name"
                className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide"
              >
                Search Name
              </label>
              <input
                id="search-name"
                type="text"
                placeholder="Type name…"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/30"
              />
            </div>

            <div className="flex-1 min-w-[150px]">
              <label
                htmlFor="office-filter"
                className="mb-2 block text-xs font-semibold text-slate-700 uppercase tracking-wide"
              >
                Office Filter
              </label>
              <select
                id="office-filter"
                value={officeFilter}
                onChange={(e) => setOfficeFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/30"
              >
                <option value="">All Offices</option>
                {officeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    Office {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSearch}
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ backgroundColor: HEADER_BLUE }}
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchName("");
                  setOfficeFilter("");
                  setAppliedFilter({ name: "", office: "" });
                  setPage(1);
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex-1 overflow-auto">
          {requestLoading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-slate-500">
                Loading employee registrations…
              </p>
            </div>
          ) : pageRows.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-slate-500">
                No pending registrations found.
              </p>
            </div>
          ) : (
            <RequestEmployeesDataTable
              loading={false}
              pageRows={pageRows}
              isSuper={isSuper}
              onView={(row) => {
                setViewEmployee(row);
                setOpenViewModal(true);
              }}
              onAddRegistration={openRegistrationModal}
              addSalary={openSalaryModal}
              onRemove={handleDelete}
            />
          )}
        </div>

        {/* Footer Pagination */}
        {pageRows.length > 0 && (
          <div
            className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 text-sm"
            style={{ backgroundColor: HEADER_BLUE, color: "#fff" }}
          >
            <span className="text-xs sm:text-sm font-medium">
              {filteredData.length === 0
                ? "No rows"
                : `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(
                    currentPage * PAGE_SIZE,
                    filteredData.length,
                  )} of ${filteredData.length}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded border border-white/40 px-2 py-1 text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <EmployeeDetailsModal
        open={openViewModal}
        employee={viewEmployee}
        isSuper={isSuper}
        onClose={() => setOpenViewModal(false)}
      />

      <RegistrationModal
        open={openRegistration}
        selectedEmployee={selectedEmployee}
        regForm={regForm}
        onRegChange={handleRegChange}
        onSubmit={handleRegSubmit}
        onClose={() => setOpenRegistration(false)}
        addLoading={addLoading}
        addError={addError}
      />

      <AddSalary
        open={openSalary}
        selectedEmployee={selectedEmployee}
        addsalary={addsalary}
        token={token}
        onSalaryChange={handleSalaryChange}
        onSubmit={handleSalarySubmit}
        onClose={() => setOpenSalary(false)}
        addLoading={addLoading}
        addError={addError}
      />
    </section>
  );
}

export default AddEmployeePage;
