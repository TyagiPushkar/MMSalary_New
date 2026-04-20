import { ADD_EMPLOYEE_THEME } from './addEmployeeTheme'

const inputClassName =
  'h-9 w-full rounded-md border-[1.5px] bg-white px-3 text-sm text-slate-900 outline-none transition ' +
  'border-black hover:border-black focus:border-[#1547bd] focus:ring-2 focus:ring-[#1547bd]/25'

function AddEmployeeFilters({
  searchName,
  onSearchNameChange,
  officeFilter,
  onOfficeFilterChange,
  officeOptions,
  onSearchClick,
}) {
  const { filterBarBg, filterBarBorder, headerBlue } = ADD_EMPLOYEE_THEME

  return (
    <div
      className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border p-4 shadow-sm"
      style={{
        backgroundColor: filterBarBg,
        borderColor: filterBarBorder,
      }}
    >
      <div className="min-w-[160px] flex-1 sm:min-w-[200px]">
        <label
          htmlFor="add-emp-search-name"
          className="mb-1 block text-xs font-bold text-slate-900"
        >
          Search Name
        </label>
        <input
          id="add-emp-search-name"
          type="text"
          autoComplete="off"
          placeholder="Type name…"
          value={searchName}
          onChange={(e) => onSearchNameChange(e.target.value)}
          className={inputClassName}
        />
      </div>

      <div className="w-full min-w-[150px] sm:w-40">
        <label htmlFor="add-emp-office" className="mb-1 block text-xs font-bold text-slate-900">
          Office
        </label>
        <select
          id="add-emp-office"
          value={officeFilter}
          onChange={(e) => onOfficeFilterChange(e.target.value)}
          className={inputClassName}
        >
          <option value="">All</option>
          {officeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div className="flex w-full items-end sm:w-auto sm:pt-5">
        <button
          type="button"
          onClick={onSearchClick}
          className="h-9 rounded-md px-6 text-sm font-bold uppercase tracking-wide text-white shadow-md transition hover:brightness-110 active:brightness-95"
          style={{ backgroundColor: headerBlue }}
        >
          Search
        </button>
      </div>
    </div>
  )
}

export default AddEmployeeFilters
