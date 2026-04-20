function EmployeeDetailsView({ data }) {
  if (!data) return null;

  const name = data.name || "N/A";
  const phone = data.phone || "—";
  const email = data.email || "—";
  const officeid = data.officeid || "—";
  const photoUrl = data.photo || data.photo_url || null;

  const getInitials = (fullName) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(name);

  const avatarBgColor = [
    "bg-gradient-to-br from-blue-500 to-blue-600",
    "bg-gradient-to-br from-purple-500 to-purple-600",
    "bg-gradient-to-br from-emerald-500 to-emerald-600",
    "bg-gradient-to-br from-amber-500 to-amber-600",
  ][initials.charCodeAt(0) % 4];

  const isValidUrl = (str) => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const isImageUrl = (url) => {
    return /\.(jpeg|jpg|png|gif|webp)$/i.test(url);
  };

  const entries = Object.entries(data).filter(
    ([k]) =>
      ![
        "password",
        "photo",
        "photo_url",
        "name",
        "phone",
        "email",
        "officeid",
        "department",
        "position",
      ].includes(k),
  );

  return (
    <div className="space-y-6">
      {/* HEADER CARD */}
      <div className="rounded-2xl bg-white shadow-md border border-slate-200 p-5 flex gap-5 items-center">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={name}
              className="h-24 w-24 rounded-xl object-cover border-2 border-slate-200 shadow-sm"
            />
          ) : (
            <div
              className={`h-24 w-24 flex items-center justify-center rounded-xl text-white text-3xl font-bold shadow ${avatarBgColor}`}
            >
              {initials}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-slate-900">
            {name}
          </h2>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-500 text-xs uppercase">Office ID</p>
              <p className="font-medium text-slate-800">{officeid}</p>
            </div>

            <div>
              <p className="text-slate-500 text-xs uppercase">Phone</p>
              <p className="font-medium text-slate-800">{phone}</p>
            </div>

            {email !== "—" && (
              <div className="sm:col-span-2">
                <p className="text-slate-500 text-xs uppercase">Email</p>
                <p className="font-medium text-slate-800 break-all">
                  {email}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DETAILS */}
      {entries.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">
            Additional Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {entries.map(([key, value]) => {
              const val =
                value == null || value === "" ? "—" : String(value);

              return (
                <div
                  key={key}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
                >
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    {key.replace(/_/g, " ")}
                  </p>

                  <div className="text-sm text-slate-900">
                    {isValidUrl(val) ? (
                      isImageUrl(val) ? (
                        <img
                          src={val}
                          alt={key}
                          className="mt-2 rounded-lg border max-h-44 w-full object-cover"
                        />
                      ) : (
                        <a
                          href={val}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
                        >
                          View Document
                        </a>
                      )
                    ) : (
                      <p className="font-medium break-words">{val}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeDetailsView;