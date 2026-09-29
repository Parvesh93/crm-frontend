import Sidebar from "../components/ui/Sidebar";
import Topbar from "../components/ui/Topbar";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Sidebar />
      <Topbar />

      <div className="min-h-screen pt-[72px] lg:pl-[248px]">
        <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <div className="mx-auto w-full max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
