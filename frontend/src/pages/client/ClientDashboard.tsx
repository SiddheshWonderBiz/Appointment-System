import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Calendar, List, LogOut } from "lucide-react";
import Header from "../../common/Header";
import client from "../../assets/client.png";

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <Header />

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-12">
          {/* LEFT CONTENT */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-2xl sm:text-3xl font-serif text-gray-900 mb-2">
              Welcome back,{" "}
              <span className="text-emerald-600">{user?.name}</span>
            </h2>

            <p className="text-gray-600 mb-8">
              What would you like to do today?
            </p>

            {/* VERTICAL CARDS */}
            <div className="flex flex-col gap-6">
              {/* BOOK APPOINTMENT */}
              <div
                onClick={() => navigate("/create-appointment")}
                className="group cursor-pointer bg-white rounded-2xl border p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 mb-4">
                  <Calendar />
                </div>

                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-emerald-600 transition">
                  Book Appointment
                </h3>

                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  Schedule a new consultation with a consultant.
                </p>
              </div>

              {/* MY APPOINTMENTS */}
              <div
                onClick={() => navigate("/my-appointments")}
                className="group cursor-pointer bg-white rounded-2xl border p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 mb-4">
                  <List />
                </div>

                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition">
                  My Appointments
                </h3>

                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  View and manage your scheduled appointments.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE  */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <img
              src={client}
              alt="Client illustration"
              className="w-full max-w-md sm:max-w-lg lg:max-w-xl xl:max-w-2xl object-contain"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
