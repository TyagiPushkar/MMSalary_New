import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageTitle from "../components/shared/PageTitle";
import { fetchAttendanceByDateThunk } from "../store/slices/attendanceSlice";

const HEADER_BLUE = "#1547bd";

// function exportCsv(rows, suffix = "employees") {
//   if (!rows.length) return;
//   const keys = [...ESSENTIAL_COLUMNS.map((c) => c.key), "id"];
//   const uniqueKeys = [...new Set(keys)];
//   const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
//   const header = uniqueKeys.join(",");
//   const body = rows
//     .map((r) => uniqueKeys.map((k) => esc(r[k])).join(","))
//     .join("\n");
//   const blob = new Blob([`${header}\n${body}`], {
//     type: "text/csv;charset=utf-8;",
//   });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = `${suffix}-${new Date().toISOString().slice(0, 10)}.csv`;
//   a.click();
//   URL.revokeObjectURL(url);
// }

function AttendancePage() {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.attendance);

  const [searchName, setSearchName] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [appliedName, setAppliedName] = useState("");

  // Fetch attendance when date changes
  useEffect(() => {
    dispatch(fetchAttendanceByDateThunk({ date: selectedDate }));
  }, [dispatch, selectedDate]);

  // Filter data by name on frontend
  const filteredData = useMemo(() => {
    return items.filter((record) => {
      const nameMatch =
        !appliedName ||
        (record.name || "").toLowerCase().includes(appliedName.toLowerCase());
      return nameMatch;
    });
  }, [items, appliedName]);

  const handleSearch = () => {
    setAppliedName(searchName);
    setPage(1); // ✅ reset page
  };

  const handleReset = () => {
    setSearchName("");
    setAppliedName("");
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setPage(1); // ✅ reset page
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  const currentPage = Math.min(Math.max(1, page), totalPages);

  const pageRows = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <section className="flex flex-col gap-4 overflow-hidden">
      <div className="flex ">
        <PageTitle
          title="Attendance"
          subtitle="View attendance records with entry and exit photos."
        />
        <button>exort to excel</button>
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
                FROM
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full rounded-lg border-[1.5px] border-slate-300 px-3 py-2 text-sm outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
              />
            </div>
            <div className="w-40">
              <label className="mb-1 block text-xs font-bold text-slate-700">
                TO
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="w-full rounded-lg border-[1.5px] border-slate-300 px-3 py-2 text-sm outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
              />
            </div>

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
          ) : filteredData.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-sm text-slate-500">
                No attendance records found.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead
                className="sticky top-0 bg-white"
                style={{ backgroundColor: HEADER_BLUE }}
              >
                <tr>
                  <th className="px-4 py-3 font-semibold text-white">
                    Employee ID
                  </th>
                  <th className="px-4 py-3 font-semibold text-white">
                    Employee
                  </th>
                  <th className="px-4 py-3 font-semibold text-white">
                    Office ID
                  </th>
                  <th className="px-4 py-3 font-semibold text-white">
                    Entry Time
                  </th>
                  <th className="px-4 py-3 font-semibold text-white">
                    Exit Time
                  </th>
                  <th className="px-4 py-3 font-semibold text-white">Hours</th>
                  <th className="px-4 py-3 font-semibold text-white">Photos</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((record, idx) => (
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
                      {record.entry_date} {record.entry_time}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {record.exit_date} {record.exit_time}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {record.working_hours} hrs
                      </span>
                    </td>
                    {/* <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {record.entry_photo && (
                          <a
                            href={record.entry_photo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 text-blue-600 transition hover:bg-blue-200"
                            title="Entry Photo"
                          >
                            📷
                          </a>
                        )}
                        {record.exit_photo && (
                          <a
                            href={record.exit_photo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-purple-100 text-purple-600 transition hover:bg-purple-200"
                            title="Exit Photo"
                          >
                            📷
                          </a>
                        )}
                      </div>
                    </td> */}
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
                ))}
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
    </section>
  );
}

export default AttendancePage;
