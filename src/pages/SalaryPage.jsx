import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import PageTitle from "../components/shared/PageTitle";
import { dataService } from "../services/dataService";

function SalaryPage() {
  const { token } = useSelector((state) => state.auth);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (token) {
      dataService.getSalary(token).then((response) => setItems(response.data));
    }
  }, [token]);

  return (
    <section>
      <PageTitle title="Salary" subtitle="Super role only page." />
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Month</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="px-4 py-3">{item.employee}</td>
                <td className="px-4 py-3">{item.month}</td>
                <td className="px-4 py-3">Rs. {item.amount}</td>
                <td className="px-4 py-3">{item.paid ? "Paid" : "Pending"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default SalaryPage;
