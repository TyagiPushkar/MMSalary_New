import React, { useState } from "react";
import { IconClose } from "./AddEmployeeIcons";
import { ADD_EMPLOYEE_THEME } from "./addEmployeeTheme";

const fieldClass =
  "w-full rounded-md border-[1.5px] border-black bg-white px-3 py-2 text-sm text-slate-900 outline-none " +
  "transition hover:border-black focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/25";

// File Upload Component (defined outside to avoid recreation on render)
function FileUploadInput({ label, field, files, onFileChange }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm">
        <span className="mb-1 block text-xs font-bold text-slate-800">
          {label}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange(field)}
          className={fieldClass}
        />
      </label>
      {files[field] && (
        <p className="text-xs font-medium text-green-600">
          ✓ {files[field].name}
        </p>
      )}
    </div>
  );
}

function RegistrationModal({
  open,
  selectedEmployee,
  regForm,
  onRegChange,
  onSubmit,
  onClose,
  addLoading,
  addError,
}) {
  // Hooks must be called before early return
  // File upload states (documents only, no profile photo upload)
  const [files, setFiles] = useState({
    aadharPhoto: null,
    panPhoto: null,
    dlPhoto: null,
    rcPhoto: null,
    passbookPhoto: null,
  });

  if (!open) return null;

  const { headerBlue } = ADD_EMPLOYEE_THEME;

  const handleFileChange = (field) => (e) => {
    const file = e.target.files[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [field]: file }));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Create FormData to include all files
    const formData = new FormData();

    // Add all form fields (including photo URL from regForm)
    Object.keys(regForm).forEach((key) => {
      formData.append(key, regForm[key]);
    });

    // Add all document photos
    if (files.aadharPhoto) formData.append("aadhar_photo", files.aadharPhoto);
    if (files.panPhoto) formData.append("pan_photo", files.panPhoto);
    if (files.dlPhoto) formData.append("dl_photo", files.dlPhoto);
    if (files.rcPhoto) formData.append("rc_photo", files.rcPhoto);
    if (files.passbookPhoto)
      formData.append("passbook_photo", files.passbookPhoto);

    // Call parent submit with FormData
    onSubmit(e, formData);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-modal-title"
    >
      <div className="max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
          <span
            id="registration-modal-title"
            className="text-lg font-bold text-slate-900"
          >
            Add employee registration
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-600 transition hover:bg-slate-200/80"
            aria-label="Close"
          >
            <IconClose />
          </button>
        </div>

        <form
          onSubmit={handleFormSubmit}
          className="max-h-[75vh] overflow-y-auto border-b border-slate-200 p-5 sm:p-6"
        >
          {/* Photo Display Section (Read-only from URL) */}
          {regForm.photo && (
            <div className="mb-6 flex flex-col items-center gap-3 rounded-lg bg-slate-50 p-4">
              <img
                src={regForm.photo}
                alt="Employee"
                className="h-24 w-24 rounded-lg border-2 border-slate-300 object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/96?text=Photo";
                }}
              />
              <p className="text-xs font-medium text-slate-600">
                Current Photo
              </p>
            </div>
          )}

          {/* Basic Information */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-bold text-slate-800">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  Name
                </span>
                <input
                  name="name"
                  value={regForm.name}
                  onChange={onRegChange}
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  Phone
                </span>
                <input
                  name="phone"
                  value={regForm.phone}
                  onChange={onRegChange}
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  Office ID
                </span>
                <input
                  name="officeid"
                  value={regForm.officeid}
                  onChange={onRegChange}
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  Location
                </span>
                <input
                  name="location"
                  value={regForm.location}
                  onChange={onRegChange}
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  Employee Role
                </span>
                <input
                  name="employee_role"
                  value={regForm.employee_role}
                  onChange={onRegChange}
                  className={fieldClass}
                />
              </label>
              {/* its deparment is not being used in backend so hiding for now */}
              {/* <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  Department
                </span>
                <input
                  name="department"
                  value={regForm.department}
                  onChange={onRegChange}
                  className={fieldClass}
                />
              </label> */}
              {/* <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  Position
                </span>
                <input
                  name="position"
                  value={regForm.position}
                  onChange={onRegChange}
                  className={fieldClass}
                />
              </label> */}
            </div>
          </div>

          {/* Personal Details */}
          <div className="mb-6 border-t border-slate-200 pt-6">
            <h3 className="mb-3 text-sm font-bold text-slate-800">
              Personal Details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  Father Name
                </span>
                <input
                  name="father_name"
                  value={regForm.father_name || ""}
                  onChange={onRegChange}
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  Date of Birth
                </span>
                <input
                  type="date"
                  name="dob"
                  value={regForm.dob || ""}
                  onChange={onRegChange}
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  Address
                </span>
                <textarea
                  name="address"
                  value={regForm.address || ""}
                  onChange={onRegChange}
                  rows="2"
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  District
                </span>
                <input
                  name="district"
                  value={regForm.district || ""}
                  onChange={onRegChange}
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  State
                </span>
                <input
                  name="state"
                  value={regForm.state || ""}
                  onChange={onRegChange}
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  Pin Code
                </span>
                <input
                  name="pin_code"
                  value={regForm.pin_code || ""}
                  onChange={onRegChange}
                  className={fieldClass}
                />
              </label>
            </div>
          </div>

          {/* Aadhar & PAN */}
          <div className="mb-6 border-t border-slate-200 pt-6">
            <h3 className="mb-3 text-sm font-bold text-slate-800">
              Aadhar & PAN Details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  Aadhar Number
                </span>
                <input
                  name="aadhar_number"
                  value={regForm.aadhar_number || ""}
                  onChange={onRegChange}
                  className={fieldClass}
                />
              </label>
              <FileUploadInput
                label="Upload Aadhar"
                field="aadharPhoto"
                files={files}
                onFileChange={handleFileChange}
              />
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  PAN Number
                </span>
                <input
                  name="pan_card"
                  value={regForm.pan_card || ""}
                  onChange={onRegChange}
                  className={fieldClass}
                />
              </label>
              <FileUploadInput
                label="Upload PAN"
                field="panPhoto"
                files={files}
                onFileChange={handleFileChange}
              />
            </div>
          </div>

          {/* DL & RC */}
          <div className="mb-6 border-t border-slate-200 pt-6">
            <h3 className="mb-3 text-sm font-bold text-slate-800">
              DL & RC Details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  Driving License Number
                </span>
                <input
                  name="driving_license_no"
                  value={regForm.driving_license_no || ""}
                  onChange={onRegChange}
                  className={fieldClass}
                />
              </label>
              <FileUploadInput
                label="Upload Driving License"
                field="dlPhoto"
                files={files}
                onFileChange={handleFileChange}
              />
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  RC Number
                </span>
                <input
                  name="rc_number"
                  value={regForm.rc_number || ""}
                  onChange={onRegChange}
                  className={fieldClass}
                />
              </label>
              <FileUploadInput
                label="Upload RC"
                field="rcPhoto"
                files={files}
                onFileChange={handleFileChange}
              />
            </div>
          </div>

          {/* Bank Details */}
          <div className="mb-6 border-t border-slate-200 pt-6">
            <h3 className="mb-3 text-sm font-bold text-slate-800">
              Bank Details
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  Account Holder Name
                </span>
                <input
                  name="ac_name"
                  value={regForm.ac_name || ""}
                  onChange={onRegChange}
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  IFSC Code
                </span>
                <input
                  name="ifsc"
                  value={regForm.ifsc || ""}
                  onChange={onRegChange}
                  className={fieldClass}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1 block text-xs font-bold text-slate-800">
                  Account Number
                </span>
                <input
                  name="account_num"
                  value={regForm.account_num || ""}
                  onChange={onRegChange}
                  className={fieldClass}
                />
              </label>
              <FileUploadInput
                label="Upload Bank Passbook"
                field="passbookPhoto"
                files={files}
                onFileChange={handleFileChange}
              />
            </div>
          </div>

          {selectedEmployee ? (
            <p className="mt-4 rounded-md bg-slate-100 px-3 py-2 text-xs text-slate-600">
              Prefilled from request row ID{" "}
              <span className="font-semibold text-slate-800">
                {selectedEmployee.id ?? selectedEmployee.employeeid}
              </span>
            </p>
          ) : null}

          {addError ? (
            <p className="mt-3 text-sm font-medium text-rose-600">{addError}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border-[1.5px] border-slate-400 bg-white px-5 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addLoading}
              className="rounded-md px-6 py-2 text-sm font-bold text-white shadow-md transition hover:brightness-110 disabled:opacity-50"
              style={{ backgroundColor: headerBlue }}
            >
              {addLoading ? "Saving…" : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegistrationModal;
