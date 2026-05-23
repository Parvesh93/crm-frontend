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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
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
</Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;