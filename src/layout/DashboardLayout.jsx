import Sidebar from "../components/ui/Sidebar";
import Topbar from "../components/ui/Topbar";

function DashboardLayout({ children }) {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;