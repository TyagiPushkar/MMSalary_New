import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageTitle from "../components/shared/PageTitle";
import StatusToggle from "../components/shared/StatusToggle";
import { FiEye, FiEdit2 } from "react-icons/fi";
import {
  fetchAllAdminsThunk,
  updateAdminStatusThunk,
  updateAdminDetailsThunk,
} from "../store/slices/adminSlice";

const HEADER_BLUE = "#1547bd";

// Essential columns only for clean UI
const ESSENTIAL_COLUMNS = [
  { key: "admin_name", label: "Admin Name", minW: "min-w-[140px]" },
  { key: "email", label: "Email", minW: "min-w-[160px]" },
  { key: "phone", label: "Phone", minW: "min-w-[110px]" },
  { key: "officeid", label: "Office ID", minW: "min-w-[100px]" },
];

// All columns for detail view
const ALL_COLUMNS = [
  { key: "admin_name", label: "Admin Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "officeid", label: "Office ID" },
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
  const [editPhone, setEditPhone] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPosition, setEditPosition] = useState("");
  const [listMode, setListMode] = useState("directory");
  const [banner, setBanner] = useState(null);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    dispatch(fetchAllAdminsThunk());
  }, [dispatch]);

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
    setEditPhone(row.phone ?? "");
    setEditCity(row.city ?? "");
    setEditAddress(row.address ?? "");
    setEditPosition(row.position ?? "");
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

  // Handle admin status update with API call
  const handleStatusToggle = async (admin) => {
    const adminId = admin.email; // Assuming email is unique identifier
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

      // Refresh list
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
      email: editRow.email,
      phone: editPhone,
      city: editCity,
      address: editAddress,
      position: editPosition,
    };
    try {
      const result = await dispatch(updateAdminDetailsThunk(payload)).unwrap();
      await dispatch(fetchAllAdminsThunk());
      closeEditModal();
      setBanner({
        type: "success",
        text: result.message || "Updated successfully.",
      });
    } catch (err) {
      setModalError(err || "Failed to update admin details.");
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
                      className={`${cellPad} text-left font-semibold whitespace-nowrap border-b border-white/20 w-12`}
                      title="View admin details"
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
                        {/* View Icon Button */}
                        <td
                          className={`${cellPad} text-center whitespace-nowrap`}
                        >
                          <button
                            type="button"
                            onClick={() => openDetailView(row)}
                            className="rounded-md p-1.5 text-sm transition hover:bg-blue-100"
                            style={{ color: HEADER_BLUE }}
                            title="View admin details"
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
                            title="Edit admin details"
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

            {/* Read-only Fields */}
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Admin Name
                </span>
                <input
                  readOnly
                  value={editRow.admin_name ?? ""}
                  className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-700"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Email
                </span>
                <input
                  readOnly
                  value={editRow.email ?? ""}
                  className="w-full rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-slate-700"
                />
              </label>
            </div>

            <hr className="mb-4 border-slate-200" />

            {/* Editable Fields */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Phone
                </span>
                <input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1547bd]/30"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  City
                </span>
                <input
                  value={editCity}
                  onChange={(e) => setEditCity(e.target.value)}
                  className="w-full rounded-lg border border-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1547bd]/30"
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block font-medium text-slate-700">
                  Address
                </span>
                <textarea
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  rows="2"
                  className="w-full rounded-lg border border-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1547bd]/30"
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Position
                </span>
                <input
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  className="w-full rounded-lg border border-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1547bd]/30"
                />
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

export default ManageAdminPage;
