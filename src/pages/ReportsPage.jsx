import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PageTitle from "../components/shared/PageTitle";
import { dataService } from "../services/dataService";

function ReportsPage() {
  const { token } = useSelector((state) => state.auth);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    if (token) {
      dataService
        .getReports(token)
        .then((response) => setReports(response.data));
    }
  }, [token]);

  return (
    <section>
      <PageTitle title="Reports" subtitle="Super role analytics reports." />
      <div className="grid gap-3">
        {reports.map((report) => (
          <div
            key={report.id}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <p className="font-semibold text-slate-800">{report.title}</p>
            <p className="text-sm text-slate-500">
              Generated: {report.generatedAt}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ReportsPage;
