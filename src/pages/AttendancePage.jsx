import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageTitle from "../components/shared/PageTitle";
import {
  fetchAttendanceByDateThunk,
  fetchAttendanceByOneDateThunk,
} from "../store/slices/attendanceSlice";
import { FiDownload } from "react-icons/fi";
import { FaFilter, FaTimes } from "react-icons/fa";

const HEADER_BLUE = "#1547bd";

const EXPORT = [
  { key: "employeeid", label: "Employee ID" },
  { key: "name", label: "Employee Name" },
  { key: "officeid", label: "Office ID" },
  { key: "entry_date", label: "Entry Date" },
  { key: "entry_time", label: "Entry Time" },
  { key: "exit_date", label: "Exit Date" },
  { key: "exit_time", label: "Exit Time" },
  { key: "working_hours", label: "Working Hours" },
  // Add more columns as needed
];

const calculateHours = (entry, exit) => {
  if (!entry || !exit) return "00:00";

  const start = new Date(`2024-01-01T${entry}`);
  const end = new Date(`2024-01-01T${exit}`);

  let diffMs = end - start;

  // Overnight shift support
  if (diffMs < 0) {
    diffMs += 24 * 60 * 60 * 1000;
  }

  const totalMinutes = Math.floor(diffMs / 1000 / 60);

  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");

  const minutes = (totalMinutes % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}`;
};

function exportCsv(rows, suffix = "employees") {
  if (!rows.length) return;
  const keys = [...EXPORT.map((c) => c.key)];
  const uniqueKeys = [...new Set(keys)];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const header = uniqueKeys.join(",");
  const body = rows
    .map((r) =>
      uniqueKeys
        .map((k) => {
          let value = r[k];

          if (k === "working_hours") {
            value =
              r.working_hours &&
              r.working_hours !== "00:00" &&
              r.working_hours !== "00:00:00"
                ? r.working_hours
                : calculateHours(r.entry_time, r.exit_time);
          }

          if (k === "entry_date" || k === "exit_date") {
            value = value ? formatDate(value) : "";
          }

          return esc(value);
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

const formatDate = (dateStr) => {
  if (!dateStr) return "—";

  const d = new Date(dateStr);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

function AttendancePage() {
  const dispatch = useDispatch();
  const { items, range, loading, error } = useSelector(
    (state) => state.attendance,
  );

  const [searchName, setSearchName] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  // const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [appliedName, setAppliedName] = useState("");
  // Kaunsa filter open hai uska state
  const [activeFilter, setActiveFilter] = useState(null);
  // Filter values store karne ke liye
  const [filters, setFilters] = useState({
    employeeid: "",
    name: "",
    officeid: "",
    entry_time: "",
    exit_time: "",
  });

  // Fetch attendance when date changes
  // useEffect(() => {
  //   dispatch(
  //     fetchAttendanceByDateThunk({ fromdate: selectedDate, todate: toDate }),
  //   );
  // }, [dispatch, selectedDate, toDate]);
  useEffect(() => {
    dispatch(fetchAttendanceByOneDateThunk({ date: selectedDate }));
  }, [dispatch, selectedDate]);

  // Filter data by name on frontend
  // Filter data by multiple fields on frontend
  const filteredData = useMemo(() => {
    return items.filter((record) => {
      const matchesSearch =
        !appliedName ||
        String(record.name || "")
          .toLowerCase()
          .includes(appliedName.toLowerCase());

      const matchesFilters = Object.keys(filters).every((key) => {
        if (!filters[key]) return true;

        const recordValue = String(record[key] || "").toLowerCase();
        const filterValue = String(filters[key]).toLowerCase();

        return recordValue.includes(filterValue);
      });

      return matchesSearch && matchesFilters;
    });
  }, [items, filters, appliedName]);

  const filteredRows = useMemo(() => {
    return filteredData.map((record) => ({
      ...record,
      id: `${record.employeeid}-${record.entry_date}-${record.entry_time}`,
    }));
  }, [filteredData]);

  const toggleFilter = (field) => {
    setActiveFilter(activeFilter === field ? null : field);
  };

  const handleInputChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    // Yahan aap API call ya frontend filtering logic add kar sakte hain
  };

  const handleSearch = () => {
    setAppliedName(searchName);
    setPage(1); // ✅ reset page
  };

  const handleReset = () => {
    const today = new Date().toISOString().split("T")[0];

    setSearchName("");
    setAppliedName("");
    setSelectedDate(today);
    setexportFromDate(today);
    setexportToDate(today);

    setFilters({
      employeeid: "",
      name: "",
      officeid: "",
      entry_time: "",
      exit_time: "",
    });
    setExportModalOpen(false);

    setPage(1);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  //export modal state
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportfromDate, setexportFromDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [exportToDate, setexportToDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Execute distinct independent API endpoint execution matrix for CSV ranges dumps
  const confirmExport = async () => {
    try {
      const response = await dispatch(
        fetchAttendanceByDateThunk({
          fromdate: exportfromDate,
          todate: exportToDate,
        }),
      );

      const exportData = response?.payload?.data || response?.payload || [];
      // console.log("Exporting data:", exportData);

      exportCsv(exportData, "attendance_report");
      setExportModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  const currentPage = Math.min(Math.max(1, page), totalPages);

  const pageRows = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const renderHeader = (label, field, inputType = "text") => (
    <th className="px-4 py-3 font-semibold text-white relative">
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

      {/* Input box jo toggle hoga */}
      {activeFilter === field && (
        <div className="absolute top-full left-0 mt-1 w-full px-2 z-10">
          <input
            type={inputType}
            className="w-full p-1 text-sm text-black rounded border border-gray-300 shadow-lg outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Search ${label}...`}
            value={filters[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            autoFocus
          />
        </div>
      )}
    </th>
  );

  return (
    <section className="flex flex-col gap-4 overflow-hidden">
      <div className="flex items-center justify-between">
        <PageTitle
          title="Attendance"
          subtitle="View attendance records with entry and exit photos."
        />

        <button
          type="button"
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-medium hover:bg-slate-50 transition-all duration-200 flex items-center gap-1"
          style={{ color: HEADER_BLUE }}
          onClick={() => setExportModalOpen(true)}
        >
          <FiDownload size={16} />
          Export Range CSV
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 px-4 py-2 text-sm text-rose-800">
          {error}
        </div>
      )}

      <div
        className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        style={{ minHeight: "70vh" }}
      >
        {/* Toolbar with Filters */}
        <div className="border-b border-slate-200 px-4 py-3">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-xs font-bold text-slate-700">
                Employee Name
              </label>
              <input
                type="text"
                placeholder="Search employee..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full rounded-lg border-[1.5px] border-slate-300 px-3 py-2 text-sm outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
              />
            </div>

            <div className="w-40">
              <label className="mb-1 block text-xs font-bold text-slate-700">
                {/* FROM */}
                DATE
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full rounded-lg border-[1.5px] border-slate-300 px-3 py-2 text-sm outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
              />
            </div>
            {/* <div className="w-40">
              <label className="mb-1 block text-xs font-bold text-slate-700">
                TO
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border-[1.5px] border-slate-300 px-3 py-2 text-sm outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
              />
            </div> */}

            <button
              onClick={handleSearch}
              className="rounded-lg px-4 py-2 text-sm font-bold text-white transition hover:brightness-110"
              style={{ backgroundColor: HEADER_BLUE }}
            >
              Search
            </button>

            <button
              onClick={handleReset}
              className="rounded-lg border-[1.5px] border-slate-400 bg-white px-4 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-slate-500">Loading attendance...</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead
                className="sticky top-0 bg-white"
                style={{ backgroundColor: HEADER_BLUE }}
              >
                <tr>
                  {renderHeader("Employee ID", "employeeid")}
                  {renderHeader("Employee", "name")}
                  {renderHeader("Office ID", "officeid")}
                  {renderHeader("Entry Time", "entry_time", "time")}
                  {renderHeader("Exit Time", "exit_time", "time")}
                  <th className="px-4 py-3 font-semibold text-white">Hours</th>
                  <th className="px-4 py-3 font-semibold text-white">Photos</th>
                </tr>
              </thead>

              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-8 text-center text-sm text-slate-500"
                    >
                      No attendance records found.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((record, idx) => {
                    const displayHours =
                      record.working_hours &&
                      record.working_hours !== "00:00" &&
                      record.working_hours !== "00:00:00"
                        ? record.working_hours
                        : calculateHours(record.entry_time, record.exit_time);

                    return (
                      <tr
                        key={record.id}
                        className={`border-t border-slate-100 hover:bg-slate-50 transition ${
                          idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                        }`}
                      >
                        <td className="px-4 py-3 text-slate-700">
                          {record.employeeid}
                        </td>

                        <td className="px-4 py-3 font-medium text-slate-900">
                          {record.name}
                        </td>

                        <td className="px-4 py-3 font-medium text-slate-900">
                          {record.officeid}
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {formatDate(record.entry_date)} {record.entry_time}
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {record.exit_date
                            ? `${formatDate(record.exit_date)} ${record.exit_time || ""}`
                            : "N/A"}
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-block rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            {displayHours || "00:00"} hrs
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {record.entry_photo && (
                              <a
                                href={record.entry_photo}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Entry Photo"
                              >
                                <img
                                  src={record.entry_photo}
                                  alt="Entry"
                                  className="h-10 w-10 object-cover rounded-md border border-gray-200 hover:scale-105 transition"
                                />
                              </a>
                            )}

                            {record.exit_photo && (
                              <a
                                href={record.exit_photo}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Exit Photo"
                              >
                                <img
                                  src={record.exit_photo}
                                  alt="Exit"
                                  className="h-10 w-10 object-cover rounded-md border border-gray-200 hover:scale-105 transition"
                                />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 text-sm"
          style={{ backgroundColor: HEADER_BLUE, color: "#fff" }}
        >
          <span>
            {filteredData.length === 0
              ? "No rows"
              : `Showing ${(currentPage - 1) * pageSize + 1}–${Math.min(
                  currentPage * pageSize,
                  filteredData.length,
                )} of ${filteredData.length}`}
          </span>

          <div className="flex items-center gap-2">
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border border-white/40 px-3 py-1 text-xs disabled:opacity-40"
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
              className="rounded border border-white/40 px-3 py-1 text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {/* export model */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">Export Attendance Data</h2>

            <input
              type="date"
              value={exportfromDate}
              onChange={(e) => setexportFromDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-5"
            />
            <input
              type="date"
              value={exportToDate}
              onChange={(e) => setexportToDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-5"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleReset()}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={confirmExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                export
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AttendancePage;
