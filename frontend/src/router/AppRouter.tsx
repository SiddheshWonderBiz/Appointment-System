import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Unauthorized from "../pages/Unauthorized";
import ProtectedRoute from "../routes/ProtectedRoute";
import ConsultantDashboard from "../pages/consultant/ConsultantDashboard";
import ClientDashboard from "../pages/client/ClientDashboard";
import CreateAppointment from "../pages/client/CreateAppointment";
import MyAppointments from "../pages/client/MyAppointments";
import PendingAppointments from "../pages/consultant/PendingAppointments";
import ScheduledAppointments from "../pages/consultant/ScheduledAppointments";
import AppointmentHistory from "../pages/consultant/AppointmentHistory";
import ProfilePage from "../pages/ProfilePage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        // Protected Routes
        <Route element={<ProtectedRoute allowedRoles={["CLIENT"]} />}>
          <Route path="/client" element={<ClientDashboard />} />
          <Route path="/create-appointment" element={<CreateAppointment />} />
          <Route path="/my-appointments" element={<MyAppointments />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["CONSULTANT"]} />}>
          <Route path="/consultant" element={<ConsultantDashboard />} />
          <Route
            path="/consultant/appointments/pending"
            element={<PendingAppointments />}
          />
          <Route
            path="/consultant/appointments/scheduled"
            element={<ScheduledAppointments />}
          />
          <Route
            path="/consultant/appointments/history"
            element={<AppointmentHistory />}
          />
        </Route>
        <Route
          element={<ProtectedRoute allowedRoles={["CLIENT", "CONSULTANT"]} />}
        >
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
