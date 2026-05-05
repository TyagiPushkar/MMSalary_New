import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      {/* <div className="mx-auto flex max-w-7xl gap-4 px-4 py-4"> */}
      <div className="mx-auto flex max-w-7xl gap-4 px-4 py-4 overflow-x-hidden">
        <Sidebar />
        {/* <main className="min-h-[calc(100vh-7rem)] flex-1 rounded-xl border border-slate-200 bg-white p-5"> */}
        <main className="min-w-0 flex-1 min-h-[calc(100vh-7rem)] rounded-xl border border-slate-200 bg-white p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
