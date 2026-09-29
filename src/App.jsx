import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import AddClient from "./pages/AddClient";
import ProtectedRoute from "./components/ProtectedRoute";
import ClientDetails from "./pages/ClientDetails";
import EditClient from "./pages/EditClient";
import Projects from "./pages/Projects";
import AddProject from "./pages/AddProject";
import ProjectDetails from "./pages/ProjectDetails";
import EditProject from "./pages/EditProject";
import Tasks from "./pages/Tasks";
import AddTask from "./pages/AddTask";
import TaskDetails from "./pages/TaskDetails";
import AITaskGenerator from "./pages/AITaskGenerator";
import TaskKanban from "./pages/TaskKanban";
import Users from "./pages/Users";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";
import Earnings from "./pages/Earnings";
import AddPayment from "./pages/AddPayment";
import Settings from "./pages/Settings";
import Receivables from "./pages/Receivables";
import Leads from "./pages/Leads";
import AddLead from "./pages/AddLead";
import LeadDetails from "./pages/LeadDetails";
import useAuthStore from "./store/authStore";

function RootRedirect() {
  const token = useAuthStore((state) => state.token);
  return <Navigate to={token ? "/dashboard" : "/login"} replace />;
}

function PublicOnlyRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  return token ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/clients" element={<Clients />} />
  <Route path="/clients/:id" element={<ClientDetails />} />
  <Route path="/add-client" element={<AddClient />} />
  <Route path="/clients/:id/edit" element={<EditClient />} />
  <Route path="/projects" element={<Projects />} />
<Route path="/add-project" element={<AddProject />} />
<Route path="/projects/:id" element={<ProjectDetails />} />
<Route
  path="/projects/:id/edit"
  element={<EditProject />}
/>
<Route path="/tasks" element={<Tasks />} />
<Route path="/add-task" element={<AddTask />} />
<Route path="/tasks/:id" element={<TaskDetails />} />
<Route path="/ai-task-generator" element={<AITaskGenerator />} />
<Route path="/task-board" element={<TaskKanban />} />
<Route path="/users" element={<Users />} />
<Route path="/add-user" element={<AddUser />} />
<Route path="/users/:id/edit" element={<EditUser />} />
<Route path="/earnings" element={<Earnings />} />
<Route path="/add-payment" element={<AddPayment />} />
<Route path="/settings" element={<Settings />} />
<Route path="/receivables" element={<Receivables />} />
<Route path="/leads" element={<Leads />} />
<Route path="/add-lead" element={<AddLead />} />
<Route path="/leads/:id" element={<LeadDetails />} />
</Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;