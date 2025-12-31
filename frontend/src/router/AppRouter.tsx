import { BrowserRouter , Route , Routes } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Unauthorized from "../pages/Unauthorized";
import ProtectedRoute from "../routes/ProtectedRoute";
import ConsultantDashboard from "../pages/ConsultantDashboard";
import ClientDashboard from "../pages/client/ClientDashboard";
import CreateAppointment from "../pages/client/CreateAppointment";
import MyAppointments from "../pages/client/MyAppointments";


export default function AppRouter() {
    return(
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            // Protected Routes
            <Route element={<ProtectedRoute allowedRoles={['CLIENT']} />} >
                <Route path="/client" element={<ClientDashboard />} />
                <Route path="/create-appointment" element={<CreateAppointment />} />
                <Route path="/my-appointments" element={<MyAppointments />} />
            </Route>    
            <Route element={<ProtectedRoute allowedRoles={['CONSULTANT']} />} >
                <Route path="/consultant" element={<ConsultantDashboard />} />
            </Route>
        </Routes>
        </BrowserRouter>
    )
}