import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { IconClose } from "./AddEmployeeIcons";
import { ADD_EMPLOYEE_THEME } from "./addEmployeeTheme";

const fieldClass =
  "w-full rounded-md border-[1.5px] border-black bg-white px-3 py-2 text-sm text-slate-900 outline-none " +
  "transition hover:border-black focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/25";

function AddSalary({
  open,
  selectedEmployee,
  addsalary,
  token,
  onSalaryChange,
  onSubmit,
  onClose,
  addLoading,
  addError,
}) {
  const [offices, setOffices] = useState([]);
  const [officesLoading, setOfficesLoading] = useState(false);
  const [localSalary, setLocalSalary] = useState("");
  const [localOffices, setLocalOffices] = useState([]);

  const fetchOffices = useCallback(async () => {
    if (!token) return;
    setOfficesLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_PHP_BASE_URL || "https://namami-infotech.com/MMSalary"}/office_admin/get_offices.php`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (response.data.status === true && Array.isArray(response.data.data)) {
        setOffices(response.data.data);
        // console.log("Fetched offices:", response.data.data);
      } else {
        setOffices([]);
      }
    } catch (error) {
      console.error("Error fetching offices:", error);
      setOffices([]);
    } finally {
      setOfficesLoading(false);
    }
  }, [token]);

  // 1. Sirf API call ke liye
  useEffect(() => {
    if (open && token) {
      fetchOffices();
    }
  }, [open, token, fetchOffices]);

  // 2. State sync karne ke liye (Safe Way)
  useEffect(() => {
    if (open) {
      const incomingSalary = addsalary?.salary || "";
      const incomingOffices = Array.isArray(addsalary?.multi_officeids)
        ? addsalary.multi_officeids.map(String)
        : [];

      setLocalSalary(incomingSalary);
      setLocalOffices(incomingOffices);
    } else {
      // Jab modal close ho toh saaf kar do taaki "cascading" na ho
      setLocalSalary("");
      setLocalOffices([]);
    }
    // Yahan se fetchOffices hata diya taaki infinite loop na bane
  }, [open, addsalary]);

  const handleSalaryChange = (e) => {
    const value = e.target.value;
    setLocalSalary(value);
    onSalaryChange?.({ target: { name: "salary", value } });
  };

  const handleOfficeToggle = (officeId) => {
    const idStr = String(officeId);
    setLocalOffices((prev) =>
      prev.includes(idStr)
        ? prev.filter((id) => id !== idStr)
        : [...prev, idStr],
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!localSalary || String(localSalary).trim() === "") {
      alert("Please enter salary amount");
      return;
    }

    if (localOffices.length === 0) {
      alert("Please select at least one office");
      return;
    }

    const payload = {
      salary: localSalary,
      multi_officeids: localOffices,
      employee_id: selectedEmployee?.id || selectedEmployee?.employeeid,
    };

    // console.log("1 process Submitting salary with payload:", payload);

    onSubmit?.(e, payload);
  };

  if (!open || !selectedEmployee) return null;

  const { headerBlue } = ADD_EMPLOYEE_THEME;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[1px]"
      role="dialog"
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
          <span className="text-lg font-bold text-slate-900">
            💰 Add Salary - {selectedEmployee?.name || "Employee"}
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-200/80"
          >
            <IconClose />
          </button>
        </div>

        <form className="flex flex-col gap-6 overflow-y-auto p-5 sm:max-h-[60vh] sm:p-6">
          {/* Employee Info */}
          <div className="rounded-lg bg-slate-50 p-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-600">Employee</p>
              <p className="text-sm font-bold text-slate-900">
                {selectedEmployee?.name}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600">Phone</p>
              <p className="text-sm font-bold text-slate-900">
                {selectedEmployee?.phone || "N/A"}
              </p>
            </div>
          </div>

          {/* Salary Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Salary Amount *
            </label>
            <input
              type="number"
              placeholder="Enter salary amount"
              value={localSalary}
              onChange={handleSalaryChange}
              step="0.01"
              className={fieldClass}
              required
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {localOffices.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
              >
                ID: {id}
                <button
                  type="button"
                  onClick={() => handleOfficeToggle(id)}
                  className="hover:text-red-500"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          {/* Office Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-3">
              Select Offices * ({localOffices.length} selected)
            </label>

            {officesLoading ? (
              <div className="text-center py-4 border rounded-lg text-slate-500">
                Loading offices...
              </div>
            ) : offices.length === 0 ? (
              <div className="text-center py-4 border rounded-lg text-slate-500">
                No offices found
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-300 p-2">
                {offices.map((off, index) => {
                  const id = String(off.id || off); // Handle both object or primitive
                  const name = off.name || off.office_name || `${id}`;
                  return (
                    <label
                      key={`${id}-${index}`} // ✅ FIX HERE
                      className="flex items-center gap-3 p-2 hover:bg-blue-50 cursor-pointer rounded"
                    >
                      <input
                        type="checkbox"
                        checked={localOffices.includes(id)}
                        onChange={() => handleOfficeToggle(id)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm text-slate-700">{name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Pills */}

          {addError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {addError}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 bg-slate-50 px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-bold border rounded-md hover:bg-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={addLoading || officesLoading}
            className="px-6 py-2 text-sm font-bold text-white rounded-md shadow-md disabled:opacity-50"
            style={{ backgroundColor: headerBlue || "#1547bd" }}
          >
            {addLoading ? "Adding..." : "Add Salary"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddSalary;
