import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PageTitle from "../components/shared/PageTitle";
import {
  createOfficeThunk,
  fetchAllOfficesThunk,
  updateOfficeDetailsThunk,
  updateOfficeStatusThunk,
} from "../store/slices/officeSlice";
// import officeService from "../services/officeService";
import { FiEdit2 } from "react-icons/fi";
import StatusToggle from "../components/shared/StatusToggle";

const HEADER_BLUE = "#1547bd";

export const AddOfficesPage = () => {
  const dispatch = useDispatch();

  const {
    allData = [],
    loading,
    error,
    statusUpdateLoading,
  } = useSelector((state) => state.offices);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);
  const [formData, setFormData] = useState({
    office_id: "",
    lat: "",
    lon: "",
  });
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    dispatch(fetchAllOfficesThunk());
  }, [dispatch]);

  const openAddModal = () => {
    setEditingOffice(null);
    setFormData({
      office_id: "",
      lat: "",
      lon: "",
    });
    setModalOpen(true);
    setBanner(null);
  };

  const openEditModal = (office) => {
    setEditingOffice(office);
    setFormData({
      office_id: office.office_id || office.office_name || "",
      lat: office.lat || "",
      lon: office.lon || "",
    });
    setModalOpen(true);
    setBanner(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingOffice(null);
    setFormData({
      office_id: "",
      lat: "",
      lon: "",
    });
  };

  const handleSave = async () => {
    if (!formData.office_id.trim()) {
      setBanner({ type: "error", text: "Office ID is required" });
      return;
    }
    console.log("Form data to save:", formData);
    console.log("Editing office:", editingOffice);
    try {
      const payload = {
        office_id: formData.office_id,
        lat: formData.lat,
        lon: formData.lon,
      };

      if (editingOffice && editingOffice.id) {
        await dispatch(
          updateOfficeDetailsThunk({ id: editingOffice.id, ...payload }),
        ).unwrap();
      } else {
        await dispatch(createOfficeThunk(payload)).unwrap();
      }

      setBanner({
        type: "success",
        text: `Office ${editingOffice ? "updated" : "added"} successfully!`,
      });
      closeModal();
      dispatch(fetchAllOfficesThunk());
    } catch (error) {
      setBanner({
        type: "error",
        text:
          error?.message ||
          error?.data?.message ||
          `Failed to ${editingOffice ? "update" : "add"} office`,
      });
    }
  };

  const handleStatusToggle = async (office) => {
    const currentStatus = office.active_status == 1 ? 1 : 0;
    const newStatus = currentStatus === 1 ? 0 : 1;
    console.log(
      `Toggling status for office ${office.id}: ${currentStatus} → ${newStatus}`,
    );
    try {
      await dispatch(
        updateOfficeStatusThunk({
          officeId: office.id,
          isActive: newStatus,
        }),
      ).unwrap();

      setBanner({
        type: "success",
        text: `Office status updated successfully`,
      });

      // Refresh list
      dispatch(fetchAllOfficesThunk());
    } catch (err) {
      setBanner({
        type: "error",
        text: err || "Failed to update status",
      });
    }
  };

  return (
    <section className="flex flex-col gap-4 overflow-hidden">
      <PageTitle
        title="Add Offices"
        subtitle="View and manage office records."
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={openAddModal}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          style={{ backgroundColor: HEADER_BLUE }}
        >
          + Add Office
        </button>
      </div>

      {banner && !modalOpen ? (
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

      <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-slate-500">Loading office data…</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-rose-600">{error}</p>
          </div>
        ) : allData.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <p className="text-sm text-slate-500">No offices found.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto overflow-y-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="sticky top-0 z-[1] shadow-sm">
                  <tr style={{ backgroundColor: HEADER_BLUE, color: "#fff" }}>
                    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap border-b border-white/20 w-20">
                      ID
                    </th>
                    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap border-b border-white/20 min-w-[200px]">
                      Office Name
                    </th>
                    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap border-b border-white/20 min-w-[120px]">
                      Latitude
                    </th>
                    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap border-b border-white/20 min-w-[120px]">
                      Longitude
                    </th>
                    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap border-b border-white/20 min-w-[120px]">
                      Status
                    </th>
                    <th className="px-3 py-2 text-left font-semibold whitespace-nowrap border-b border-white/20 w-20">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {allData.map((office, idx) => (
                    <tr
                      key={office.id || idx}
                      className="border-b border-slate-100 hover:bg-slate-50/80 transition"
                    >
                      <td className="px-3 py-2 text-slate-800 whitespace-nowrap text-xs">
                        {office.id || "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-800 whitespace-nowrap max-w-[200px] truncate text-xs">
                        {office.office_id || office.office_name || "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-800 whitespace-nowrap text-xs">
                        {office.lat || "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-800 whitespace-nowrap text-xs">
                        {office.lon || "—"}
                      </td>
                      {/* Status Toggle Slide Button */}
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <StatusToggle
                          isActive={office.active_status == 1}
                          onToggle={() => handleStatusToggle(office)}
                          disabled={statusUpdateLoading}
                          loading={statusUpdateLoading}
                        />
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openEditModal(office)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-blue-100"
                          style={{ color: HEADER_BLUE }}
                          title="Edit office"
                        >
                          <FiEdit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Edit/Add Modal */}
      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingOffice ? "Edit Office" : "Add New Office"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {banner && modalOpen ? (
              <p
                className={`mb-3 rounded-md px-3 py-2 text-sm ${
                  banner.type === "success"
                    ? "bg-emerald-50 text-emerald-800"
                    : "bg-rose-50 text-rose-800"
                }`}
              >
                {banner.text}
              </p>
            ) : null}

            <div className="grid grid-cols-1 gap-3">
              {/* Office Name */}
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Office Name
                </span>
                <input
                  type="text"
                  value={formData.office_id || formData.officename}
                  onChange={(e) =>
                    setFormData({ ...formData, office_id: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1547bd]/30"
                  placeholder="Enter office name"
                />
              </label>

              {/* Latitude */}
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Latitude
                </span>
                <input
                  type="text"
                  value={formData.lat}
                  onChange={(e) =>
                    setFormData({ ...formData, lat: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1547bd]/30"
                  placeholder="Enter latitude"
                />
              </label>

              {/* Longitude */}
              <label className="block text-sm">
                <span className="mb-1 block font-medium text-slate-700">
                  Longitude
                </span>
                <input
                  type="text"
                  value={formData.lon}
                  onChange={(e) =>
                    setFormData({ ...formData, lon: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-900 px-3 py-2 outline-none focus:ring-2 focus:ring-[#1547bd]/30"
                  placeholder="Enter longitude"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg px-5 py-2 text-sm font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: HEADER_BLUE }}
              >
                {editingOffice ? "Update" : "Add"} Office
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
