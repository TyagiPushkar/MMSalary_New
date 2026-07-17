import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import PageTitle from "../components/shared/PageTitle";
import { FaFilter, FaTimes } from "react-icons/fa";
import axios from "axios";
import * as XLSX from "xlsx";

const HEADER_BLUE = "#1547bd";
const API_URL = "https://www.namami-infotech.com/MMSalary/Pf/get_pf.php";

function exportToExcel(data, fileName = "PF_Records_Export") {
  if (!data || !data.length) {
    alert("No data available to export.");
    return;
  }
  const formattedData = data.map(row => ({
    "Record ID": row.ID,
    "Month": row.Month,
    "Employee Code": row.Emp_Code,
    "Location": row.Location,
    "Account Number": row.Acc_No,
    "IFSC Code": row.Ifsc,
    "Employee Name": row.emp_name,
    "Salary": row.salary,
    "PF Employee Contribution": row.PF_Emp,
    "ESIC Employee Contribution": row.ESIC_Emp,
    "PF Company Contribution": row.PF_Com,
    "ESIC Company Contribution": row.ESCI_Com,
    "File Number": row["File no"],
    "Status": row.Status,
    "Remark": row.Remark
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "PF Records");
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

function PfPage() {
  // Get user type from Redux auth store
  // const { type } = useSelector(state => state.auth.user || {});

  const user = useSelector(state => state.auth.user || {});
  const { type } = user;


  console.log("type", type);      // owner / super / normal

  console.log("user", user);      // complete user object

  console.log("user.type", user.type);

  // 1. Backend Search/Filter State Hooks
  const [searchName, setSearchName] = useState("");
  const [searchAccNo, setSearchAccNo] = useState("");
  const [searchEmpCode, setSearchEmpCode] = useState("");

  //   2. Inline Table Header Toggles
  const [activeFilter, setActiveFilter] = useState(null);
  const [inlineFilters, setInlineFilters] = useState({
    ID: "",
    Location: "",
    Month: "",
    Emp_Code: "",
    File_No: ""
  });

  const [debouncedFilters, setDebouncedFilters] = useState(inlineFilters);

  // 3. Pagination & Data Window Management
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [backendRows, setBackendRows] = useState([]); // Connect your dynamic API records here
  const [allRecordsCached, setAllRecordsCached] = useState([]);
  const [allRecordsFetched, setAllRecordsFetched] = useState(0);
  const [onePageLimit,setOnePageLimit] = useState(25);
  // Tracks whether the bulk action toolbar is expanded/visible
  const [showBulkPanel, setShowBulkPanel] = useState(false);

  // Tracks the IDs of rows that are currently checked
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const [bulkFileNo, setBulkFileNo] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkRemark, setBulkRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);



  const toggleFilter = (field) => {
    setActiveFilter(activeFilter === field ? null : field);
  };

  const handleInlineFilterChange = (field, value) => {
    setInlineFilters({ ...inlineFilters, [field]: value });
    setPage(1);
    // TODO: Trigger backend API call with inline filters
  };


  const fetchPfData = async () => {
  setLoading(true);
  setError(null);

  // Check if any filter is applied
  const hasFilters =
    searchAccNo ||
    searchName ||
    searchEmpCode ||
    debouncedFilters.ID ||
    debouncedFilters.Month ||
    debouncedFilters.Emp_Code ||
    debouncedFilters.Location ||
    debouncedFilters.File_No;

  try {
    const response = await axios.get(API_URL, {
      params: {
        page,
        limit: hasFilters ? "all" : 25, // or -1 / 0 depending on backend
        acc_no: searchAccNo,
        name: searchName,
        emp_code: searchEmpCode,
        id: debouncedFilters.ID,
        month: debouncedFilters.Month,
        emp_code_inline: debouncedFilters.Emp_Code,
        location: debouncedFilters.Location,
        file_no: debouncedFilters.File_No,
      },
    });

    if (response.data?.data) {
      console.log("Fetched PF Data:", response.data);
      setBackendRows(response.data.data);
      setAllRecordsFetched(response.data.total|| response.data.data.length);
      setOnePageLimit(response.data.limit || 25);


      const recordCount = response.data.total || response.data.data.length;
      setTotalPages(
        // hasFilters ? 1 : Math.ceil(recordCount / 25)
          hasFilters
          ? 1
          : Math.ceil(recordCount / response.data.limit)
      );
    }
  } catch (err) {
    console.error("API error:", err);
    setError("Failed to fetch records from the server.");
  } finally {
    setLoading(false);
  }
};


console.log(allRecordsFetched, "allRecordsFetched");
console.log(onePageLimit, "onePageLimit");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(inlineFilters);
    }, 500);
    return () => clearTimeout(timer);
  }, [inlineFilters]);

  useEffect(() => {
    fetchPfData();
  }, [page, debouncedFilters]);


  const handleApplyBulkChanges = async () => {
    if (selectedRowIds.length === 0) {
      alert("Please select at least one record using the checkboxes first.");
      return;
    }

    if (bulkFileNo.trim() === "" && bulkStatus.trim() === "" && bulkRemark.trim() === "") {
      alert("Please fill in at least one bulk field (File No, Status, or Remarks) to apply.");
      return;
    }



    if (user.type === "super") {

      const blockedRecord = backendRows.find(row =>
        selectedRowIds.includes(row.ID) &&
        row["File no"] &&
        row["File no"].toString().trim() !== "" &&
        row["File no"] !== "—"
      );

      if (blockedRecord) {
        alert("Can't edit this record. Only Owner can edit records that already have a File Number.");
        return; // ❌ Stop here. No API call. No refresh.
      }
    }

    if (
      bulkFileNo.trim() === "" &&
      bulkStatus.trim() === "" &&
      bulkRemark.trim() === ""
    ) {
      alert("Please fill at least one field.");
      return;
    }

    setLoading(true);
    try {
      // 🆕 HIGHLIGHT: Replaced local array mapping with a direct POST network payload
      const response = await axios.post("https://www.namami-infotech.com/MMSalary/Pf/update_pf.php", {
        ids: selectedRowIds,
        file_no: bulkFileNo.trim(),
        status: bulkStatus.trim(),
        remark: bulkRemark.trim(),
        type: user.type,
      });

      // if (response.status === 200) {
      alert("Database updated successfully!");
      setSelectedRowIds([]);
      setBulkFileNo("");
      setBulkStatus("");
      setBulkRemark("");

      // 🆕 HIGHLIGHT: Re-fetches the fresh data from the database instantly
      fetchPfData();

    } catch (err) {
      console.error("Bulk update network failure:", err);
      alert(err.response?.data?.message || "Failed to save bulk alterations to the database server.");
    } finally {
      setLoading(false);
    }
  };





  const handleSearch = () => {
    // TODO: Trigger backend API call with main filter criteria params
    setPage(1);
    fetchPfData();
  };

  const handleReset = () => {
    setSearchName("");
    setSearchAccNo("");
    setSearchEmpCode("");
    // setInlineFilters({ ID: "", Location: "", Month: "" });
    // setActiveFilter(null);
    setInlineFilters({ ID: "", Location: "", Month: "", Emp_Code: "", File_No: "" });
    setActiveFilter(null);
    setPage(1);

  };

  const handleExcelExportAll = async () => {
    setLoading(true);
    try {
      // We call the API with search parameters, but NO page or limit parameters.
      // This forces the backend to ignore pagination and return all matching records.
      const response = await axios.get(API_URL, {
        params: {
          acc_no: searchAccNo,
          name: searchName,
          emp_code: searchEmpCode,
          id: inlineFilters.ID,
          location: inlineFilters.Location,
          month: inlineFilters.Month,
          emp_code_inline: inlineFilters.Emp_Code,
          file_no: inlineFilters.File_No
        },
      });

      const allMatchingData = response.data && response.data.data ? response.data.data : response.data;

      if (!allMatchingData || allMatchingData.length === 0) {
        alert("No data found to export.");
        return;
      }

      // This passes the full dataset to your Excel downloader function
      exportToExcel(allMatchingData);
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to fetch full dataset for Excel export.");
    } finally {
      setLoading(false);
    }
  };


  const isFilterApplied = useMemo(() => {
    const hasMainSearches =
      searchName.trim() !== "" ||
      searchAccNo.trim() !== "" ||
      searchEmpCode.trim() !== "";

    const hasInlineFilters = Object.values(inlineFilters).some(
      (val) => val !== undefined && val !== null && String(val).trim() !== ""
    );

    return hasMainSearches || hasInlineFilters;
  }, [searchName, searchAccNo, searchEmpCode, inlineFilters]);


  return (
    <section className="flex flex-col gap-4 overflow-hidden">
      {/* Structural Header Section without CSV Export */}
      <div className="flex items-center justify-between">
        <PageTitle title="Provident Fund (PF)" subtitle="Manage structural employee database records." />
        <button
          type="button"
          onClick={handleExcelExportAll}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-all duration-200 flex items-center gap-1.5 shadow-sm"
        >
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Excel (.xlsx)
        </button>
      </div>

      <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" style={{ minHeight: "70vh" }}>
        {/* Main Control Filter Bar */}
        <div className="border-b border-slate-200 px-4 py-3 bg-slate-50/50">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <label className="mb-1 block text-xs font-bold text-slate-700">Account Number</label>
              <input
                type="text"
                placeholder="Search Acc No..."
                value={searchAccNo}
                onChange={(e) => setSearchAccNo(e.target.value)}
                className="w-full rounded-lg border-[1.5px] border-slate-300 px-3 py-2 text-sm outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
              />
            </div>

            <div className="flex-1 min-w-[180px]">
              <label className="mb-1 block text-xs font-bold text-slate-700">Employee Name</label>
              <input
                type="text"
                placeholder="Search name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full rounded-lg border-[1.5px] border-slate-300 px-3 py-2 text-sm outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
              />
            </div>

            <div className="flex-1 min-w-[180px]">
              <label className="mb-1 block text-xs font-bold text-slate-700">Employee Code</label>
              <input
                type="text"
                placeholder="Search Emp Code..."
                value={searchEmpCode}
                onChange={(e) => setSearchEmpCode(e.target.value)}
                className="w-full rounded-lg border-[1.5px] border-slate-300 px-3 py-2 text-sm outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25"
              />
            </div>

            <button onClick={handleSearch} className="rounded-lg px-5 py-2 text-sm font-bold text-white transition hover:brightness-110" style={{ backgroundColor: HEADER_BLUE }}>
              Search
            </button>

            <button onClick={handleReset} className="rounded-lg border-[1.5px] border-slate-400 bg-white px-5 py-2 text-sm font-bold text-slate-800 transition hover:bg-slate-50">
              Reset
            </button>

            <button
              type="button"
              onClick={() => setShowBulkPanel(!showBulkPanel)}
              className={`rounded-lg px-4 py-2 text-sm font-bold transition-all border ${showBulkPanel
                  ? "bg-slate-500 border-slate-500 text-white hover:bg-slate-600"
                  : "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
                }`}
            >
              {showBulkPanel ? "Hide Bulk Controls" : "Show Bulk Controls"}
            </button>
          </div>
        </div>


        {/* Simplified Bulk Update Action Panel */}
        {showBulkPanel && backendRows.length > 0 && (
          <div className="bg-blue-50/50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-end gap-3 justify-between">
            <div className="flex flex-wrap items-end gap-3 flex-1">
              <div className="w-36">
                <label className="mb-1 block text-xs font-bold text-blue-900">Bulk File No</label>
                <input
                  type="text"
                  placeholder="File No..."
                  value={bulkFileNo}
                  onChange={(e) => setBulkFileNo(e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-blue-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="w-36">
                <label className="mb-1 block text-xs font-bold text-blue-900">Bulk Status</label>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-blue-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 font-semibold text-slate-700 cursor-pointer"
                >
                  <option value="">— Select —</option>
                  <option value="done">done</option>
                </select>
              </div>

              <div className="flex-1 min-w-[150px]">
                <label className="mb-1 block text-xs font-bold text-blue-900">Bulk Remarks</label>
                <input
                  type="text"
                  placeholder="Type remarks for all rows..."
                  value={bulkRemark}
                  onChange={(e) => setBulkRemark(e.target.value)}
                  className="w-full rounded-lg border-[1.5px] border-blue-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <button
                

                type="button"
                onClick={handleApplyBulkChanges}
                className="rounded-lg px-5 py-2 text-sm font-bold text-white transition  bg-blue-600 hover:bg-blue-700 shadow-sm"

              >
                Apply to Selected ({selectedRowIds.length})
              </button>
            </div>

            <button
              onClick={() => {
                setBulkFileNo("");
                setBulkStatus("");
                setBulkRemark("");
                setSelectedRowIds([]);
              }}
              className="text-xs text-blue-700 hover:underline font-semibold pb-2"
            >
              Clear Fields
            </button>
          </div>
        )}

        {/* Data View Grid Workspace */}
        <div className="flex-1 overflow-auto max-h-[calc(70vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-slate-500 animate-pulse">Fetching data from live server...</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="sticky top-0 z-20" style={{ backgroundColor: HEADER_BLUE }}>
                <tr>

                  {/* 👇 NEW: Master Checkbox Header Cell 👇 */}
                  <th className="px-4 py-3 text-center w-12" style={{ backgroundColor: HEADER_BLUE }}>
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                      checked={backendRows.length > 0 && selectedRowIds.length === backendRows.length}
                      onChange={() => {
                        if (selectedRowIds.length === backendRows.length) {
                          setSelectedRowIds([]);
                        } else {
                          setSelectedRowIds(backendRows.map(row => row.ID));
                        }
                      }}
                    />
                  </th>
                  {/* <th className="px-4 py-3 font-semibold text-white">ID</th> */}
                  {/* 1. ID Filter Column */}
                  <th className="px-4 py-3 font-semibold text-white relative whitespace-nowrap" style={{ backgroundColor: HEADER_BLUE }}>
                    <div className="flex items-center justify-between gap-2">
                      <span>ID</span>
                      <button onClick={() => toggleFilter("ID")} className="hover:text-gray-300 transition-colors">
                        {activeFilter === "ID" ? <FaTimes size={12} /> : <FaFilter size={12} />}
                      </button>
                    </div>
                    {activeFilter === "ID" && (
                      <div className="absolute top-full left-0 mt-1 w-full px-2 z-10">
                        <input
                          type="text"
                          maxLength={11}
                          className="w-full p-1 text-xs text-black rounded border border-gray-300 shadow-lg outline-none focus:ring-2 focus:ring-blue-500 font-normal"
                          placeholder="Filter ID..."
                          value={inlineFilters.ID}
                          onChange={(e) => handleInlineFilterChange("ID", e.target.value)}
                          autoFocus
                        />
                      </div>
                    )}
                  </th>

                  {/* 2. Month Filter Column */}
                  <th className="px-4 py-3 font-semibold text-white relative whitespace-nowrap" style={{ backgroundColor: HEADER_BLUE }}>
                    <div className="flex items-center justify-between gap-2">
                      <span>Month</span>
                      <button onClick={() => toggleFilter("Month")} className="hover:text-gray-300 transition-colors">
                        {activeFilter === "Month" ? <FaTimes size={12} /> : <FaFilter size={12} />}
                      </button>
                    </div>
                    {activeFilter === "Month" && (
                      <div className="absolute top-full left-0 mt-1 w-full px-2 z-10">
                        <input
                          type="text"
                          className="w-full p-1 text-xs text-black rounded border border-gray-300 shadow-lg outline-none focus:ring-2 focus:ring-blue-500 font-normal"
                          placeholder="e.g. Dec-24"
                          value={inlineFilters.Month}
                          onChange={(e) => handleInlineFilterChange("Month", e.target.value)}
                          autoFocus
                        />
                      </div>
                    )}
                  </th>

                  {/* 🆕 3. Employee Code Filter Column */}
                  <th className="px-4 py-3 font-semibold text-white relative whitespace-nowrap" style={{ backgroundColor: HEADER_BLUE }}>
                    <div className="flex items-center justify-between gap-2">
                      <span>Emp Code</span>
                      <button onClick={() => toggleFilter("Emp_Code")} className="hover:text-gray-300 transition-colors">
                        {activeFilter === "Emp_Code" ? <FaTimes size={12} /> : <FaFilter size={12} />}
                      </button>
                    </div>
                    {activeFilter === "Emp_Code" && (
                      <div className="absolute top-full left-0 mt-1 w-full px-2 z-10">
                        <input
                          type="text"
                          className="w-full p-1 text-xs text-black rounded border border-gray-300 shadow-lg outline-none focus:ring-2 focus:ring-blue-500 font-normal"
                          placeholder="Filter Code..."
                          value={inlineFilters.Emp_Code}
                          onChange={(e) => handleInlineFilterChange("Emp_Code", e.target.value)}
                          autoFocus
                        />
                      </div>
                    )}
                  </th>

                  {/* 4. Location Filter Column */}
                  <th className="px-4 py-3 font-semibold text-white relative whitespace-nowrap" style={{ backgroundColor: HEADER_BLUE }}>
                    <div className="flex items-center justify-between gap-2">
                      <span>Location</span>
                      <button onClick={() => toggleFilter("Location")} className="hover:text-gray-300 transition-colors">
                        {activeFilter === "Location" ? <FaTimes size={12} /> : <FaFilter size={12} />}
                      </button>
                    </div>
                    {activeFilter === "Location" && (
                      <div className="absolute top-full left-0 mt-1 w-full px-2 z-10">
                        <input
                          type="text"
                          className="w-full p-1 text-xs text-black rounded border border-gray-300 shadow-lg outline-none focus:ring-2 focus:ring-blue-500 font-normal"
                          placeholder="Filter Loc..."
                          value={inlineFilters.Location}
                          onChange={(e) => handleInlineFilterChange("Location", e.target.value)}
                          autoFocus
                        />
                      </div>
                    )}
                  </th>

                  {/* <th className="px-4 py-3 font-semibold text-white">Month</th>
                    <th className="px-4 py-3 font-semibold text-white">Emp Code</th> */}
                  {/* <th className="px-4 py-3 font-semibold text-white">Location</th> */}
                  <th className="px-4 py-3 font-semibold text-white" style={{ backgroundColor: HEADER_BLUE }}>Acc No</th>
                  <th className="px-4 py-3 font-semibold text-white" style={{ backgroundColor: HEADER_BLUE }}>IFSC</th>
                  <th className="px-4 py-3 font-semibold text-white" style={{ backgroundColor: HEADER_BLUE }}>Employee Name</th>

                  <th className="px-4 py-3 font-semibold text-white relative whitespace-nowrap" style={{ backgroundColor: HEADER_BLUE }}>
                    <div className="flex items-center justify-between gap-2">
                      <span>File No</span>
                      <button onClick={() => toggleFilter("File_No")} className="hover:text-gray-300 transition-colors">
                        {activeFilter === "File_No" ? <FaTimes size={12} /> : <FaFilter size={12} />}
                      </button>
                    </div>
                    {activeFilter === "File_No" && (
                      <div className="absolute top-full left-0 mt-1 w-full px-2 z-10">
                        <input
                          type="text"
                          maxLength={11} // Keeps inputs safe matching your varchar(11) DB constraint
                          className="w-full p-1 text-xs text-black rounded border border-gray-300 shadow-lg outline-none focus:ring-2 focus:ring-blue-500 font-normal"
                          placeholder="Filter File..."
                          value={inlineFilters.File_No}
                          onChange={(e) => handleInlineFilterChange("File_No", e.target.value)}
                          autoFocus
                        />
                      </div>
                    )}
                  </th>
                  <th className="px-4 py-3 font-semibold text-white" style={{ backgroundColor: HEADER_BLUE }}>Status</th>
                  <th className="px-4 py-3 font-semibold text-white" style={{ backgroundColor: HEADER_BLUE }}>Remarks</th>

                  <th className="px-4 py-3 font-semibold text-white" style={{ backgroundColor: HEADER_BLUE }}>Salary</th>
                  <th className="px-4 py-3 font-semibold text-white" style={{ backgroundColor: HEADER_BLUE }}>PF Emp</th>
                  <th className="px-4 py-3 font-semibold text-white" style={{ backgroundColor: HEADER_BLUE }}>ESIC Emp</th>
                  <th className="px-4 py-3 font-semibold text-white" style={{ backgroundColor: HEADER_BLUE }}>PF Com</th>
                  <th className="px-4 py-3 font-semibold text-white" style={{ backgroundColor: HEADER_BLUE }}>ESIC Com</th>
                  {/* <th className="px-4 py-3 font-semibold text-white">File No</th> */}
                  {/* 🆕 5. File No Filter Column */}

                </tr>
              </thead>

              <tbody>
                {backendRows.length === 0 ? (
                  <tr>
                    <td colSpan="14" className="py-8 text-center text-sm text-slate-500">
                      No PF records found.
                    </td>
                  </tr>
                ) : (
                  backendRows.map((record, idx) => (
                    <tr key={record.ID} className={`border-t border-slate-100 hover:bg-slate-50/80 transition ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>

                      <td className="px-4 py-3 text-center w-12">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded cursor-pointer accent-blue-600"
                          checked={selectedRowIds.includes(record.ID)}
                          onChange={() => {
                            setSelectedRowIds(prev =>
                              prev.includes(record.ID)
                                ? prev.filter(id => id !== record.ID)
                                : [...prev, record.ID]
                            );
                          }}
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">{record.ID}</td>
                      <td className="px-4 py-3 text-slate-700">{record.Month}</td>
                      <td className="px-4 py-3 text-slate-800 font-medium">{record.Emp_Code}</td>
                      <td className="px-4 py-3 text-slate-700">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-medium text-xs">{record.Location}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-mono">{record.Acc_No || "—"}</td>
                      <td className="px-4 py-3 text-slate-600 font-mono uppercase text-xs">{record.Ifsc || "—"}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{record.emp_name}</td>

                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {record["File no"] || "—"}
                      </td>

                      {/* 2. Status Cell (Changed from a dropdown <select> to simple text layout) */}
                      <td className="px-4 py-3 text-slate-700 capitalize">
                        {record.Status || "—"}
                      </td>

                      {/* 3. Remarks Cell (Changed from an interactive input to read-only italic text) */}
                      <td className="px-4 py-3 text-slate-600 italic">
                        {record.Remark || "—"}
                      </td>

                      <td className="px-4 py-3 text-slate-900 font-medium">₹{Number(record.salary).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3 text-emerald-600 font-medium">₹{record.PF_Emp}</td>
                      <td className="px-4 py-3 text-amber-600">₹{record.ESIC_Emp}</td>
                      <td className="px-4 py-3 text-emerald-700 font-medium">₹{record.PF_Com}</td>
                      <td className="px-4 py-3 text-amber-700">₹{record.ESCI_Com}</td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Global Structural Pagination Controller Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 text-sm" style={{ backgroundColor: HEADER_BLUE, color: "#fff" }}>
          {/* <span>
            {backendRows.length === 0 ? "No rows" : `Page metadata context tracking sync ready`}
          </span> */}

          <span>
            {backendRows.length === 0
              ? "No rows"
              : `Total Records: ${allRecordsFetched} | Limit: ${onePageLimit}`}
          </span>

          <div className="flex items-center gap-2">
            <select
              value={page}
              onChange={(e) => setPage(Number(e.target.value))}
              className="rounded-md border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-white outline-none backdrop-blur-sm transition-all hover:bg-white/20 focus:border-white focus:ring-2 focus:ring-white/30 cursor-pointer"
            >
              {Array.from({ length: totalPages }, (_, i) => (
                <option key={i + 1} value={i + 1} className="text-black">
                  Page {i + 1}
                </option>
              ))}
            </select>
            <button type="button" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="rounded border border-white/40 px-3 py-1 text-xs disabled:opacity-40">
              Prev
            </button>

            <span className="text-xs">Page {page} / {totalPages}</span>

            <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="rounded border border-white/40 px-3 py-1 text-xs disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PfPage;