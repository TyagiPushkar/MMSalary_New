/**
 * StatusToggle - A slide toggle switch for employee active/inactive status
 * with API integration
 */
export default function StatusToggle({
  isActive,
  onToggle,
  disabled = false,
  loading = false,
}) {
  return (
    <label className="inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={isActive}
        onChange={onToggle}
        disabled={disabled || loading}
        className="sr-only peer"
      />
      <div className="peer relative inline-flex h-6 w-11 rounded-full bg-slate-300 transition after:absolute after:start-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-disabled:opacity-50 peer-disabled:cursor-not-allowed">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"></div>
          </div>
        )}
      </div>
      <span className="ms-3 text-xs font-medium text-slate-600">
        {isActive ? "Active" : "Inactive"}
      </span>
    </label>
  );
}
