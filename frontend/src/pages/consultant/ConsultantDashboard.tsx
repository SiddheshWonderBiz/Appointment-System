import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ClipboardList, CalendarCheck , HistoryIcon } from "lucide-react";
import Header from "../../common/Header";
import consultant from "../../assets/consultant.png";
import { useEffect, useState } from "react";
import api from "../../api/axios";

const ConsultantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pendingCount, setPendingCount] = useState(0);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [prevCount, setPrevCount] = useState(0);

  useEffect(() => {
    api.get("/appointment/consultant").then((res) => {
      const pending = res.data.filter(
        (a: any) => a.status === "PENDING"
      ).length;

      const scheduled = res.data.filter(
        (a: any) => a.status === "CONFIRMED"
      ).length;

      setPendingCount(pending);
      setScheduledCount(scheduled);
    });

    api.get("/appointment/consultant/history").then((res) => {
      const prev = res.data.filter(
        (a: any) => a.status == "CANCELED" || "PENDING" || "REJECTED"
      ).length;

      setPrevCount(prev);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* LEFT */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-2xl sm:text-3xl font-serif mb-2">
              Welcome, <span className="text-emerald-600">{user?.name}</span>
            </h2>

            <p className="text-gray-600 mb-8">
              Manage your consultations efficiently
            </p>

            <div className="flex flex-col gap-6">
              {/* PENDING */}
              <div
                onClick={() => navigate("/consultant/appointments/pending")}
                className="group cursor-pointer bg-white rounded-2xl border p-6 shadow-sm hover:shadow-xl transition hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-yellow-100 text-yellow-600 mb-4">
                  <ClipboardList />
                </div>

                <h3 className="text-lg font-semibold group-hover:text-yellow-600 flex items-center gap-2">
                  Pending Requests
                  {pendingCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800">
                      {pendingCount}
                    </span>
                  )}
                </h3>

                <p className="text-sm text-gray-600 mt-2">
                  Review and respond to new appointment requests.
                </p>
              </div>

              {/* SCHEDULED */}
              <div
                onClick={() => navigate("/consultant/appointments/scheduled")}
                className="group cursor-pointer bg-white rounded-2xl border p-6 shadow-sm hover:shadow-xl transition hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-100 text-emerald-600 mb-4">
                  <CalendarCheck />
                </div>

                <h3 className="text-lg font-semibold group-hover:text-emerald-600 flex items-center gap-2">
                  Scheduled Appointments
                  {scheduledCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                      {scheduledCount}
                    </span>
                  )}
                </h3>

                <p className="text-sm text-gray-600 mt-2">
                  View and complete your confirmed consultations.
                </p>
              </div>

              {/* HISTORY */}
              <div
                onClick={() => navigate("/consultant/appointments/history")}
                className="group cursor-pointer bg-white rounded-2xl border p-6 shadow-sm hover:shadow-xl transition hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-purple-100 text-purple-600 mb-4">
                  <HistoryIcon />
                </div>

                <h3 className="text-lg font-semibold group-hover:text-purple-600 flex items-center gap-2">
                  Previous Appointments
                  {prevCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">
                      {prevCount}
                    </span>
                  )}
                </h3>

                <p className="text-sm text-gray-600 mt-2">
                  View your previous accepted or rejected consultations.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <img
              src={consultant}
              alt="Consultant"
              className="w-full max-w-lg object-contain"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConsultantDashboard;
