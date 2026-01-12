import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Calendar, List } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import Header from "../../common/Header";

type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "REJECTED"
  | "COMPLETED";

type Appointment = {
  id: number;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  consultant?: {
    name: string;
  };
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [history, setHistory] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [upcomingRes, historyRes] = await Promise.all([
          api.get("/appointment/me"),
          api.get("/appointment/me/history"),
        ]);

        setUpcoming(upcomingRes.data);
        setHistory(historyRes.data);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // -------- STATS ----------
  const upcomingCount = upcoming.length;

  const completedCount = history.filter(
    (a) => a.status === "COMPLETED"
  ).length;

  const cancelledCount = history.filter(
    (a) => a.status === "CANCELLED" || a.status === "REJECTED"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-gray-600 text-xl">
            Client Dashboard
          </h1>
          <p className="text-2xl sm:text-3xl font-serif mb-2">
            Welcome back, <span className=" text-emerald-600">{user?.name}</span>
          </p>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <StatCard label="Upcoming" value={upcomingCount} />
          <StatCard label="Completed" value={completedCount} />
          <StatCard label="Cancelled" value={cancelledCount} />
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1  gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            {/* QUICK ACTIONS */}
            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ActionCard
                  icon={<Calendar size={18} />}
                  title="Book Appointment"
                  description="Schedule a new consultation"
                  color="emerald"
                  onClick={() => navigate("/create-appointment")}
                />

                <ActionCard
                  icon={<List size={18} />}
                  title="My Appointments"
                  description="View & manage appointments"
                  color="indigo"
                  onClick={() => navigate("/my-appointments")}
                />
              </div>
            </div>

            {/* UPCOMING APPOINTMENTS */}
            <div className="bg-white border rounded-xl p-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-4">
                Upcoming Appointments
              </h2>

              {loading ? (
                <p className="text-sm text-gray-500">Loading...</p>
              ) : upcoming.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-500 mb-4">
                    No upcoming appointments
                  </p>
                  <button
                    onClick={() => navigate("/create-appointment")}
                    className="px-4 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Book Appointment
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcoming.slice(0, 3).map((appt) => (
                    <div
                      key={appt.id}
                      className="flex justify-between items-center border rounded-lg p-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {appt.consultant?.name ?? "Consultant"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(appt.startAt).toLocaleString()}
                        </p>
                      </div>
                      <StatusBadge status={appt.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

/* ----------------- SMALL COMPONENTS ----------------- */

const StatCard = ({ label, value }: { label: string; value: number }) => (
  <div className="bg-white border rounded-xl p-5">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
  </div>
);

const ActionCard = ({
  icon,
  title,
  description,
  color,
  onClick,
}: any) => (
  <div
    onClick={onClick}
    className={`cursor-pointer border rounded-lg p-4 hover:border-${color}-500 transition`}
  >
    <div className="flex items-center gap-3">
      <div
        className={`w-10 h-10 flex items-center justify-center rounded-md bg-${color}-50 text-${color}-600`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
  const map: Record<AppointmentStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-gray-200 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`text-xs font-medium px-2 py-1 rounded-md ${map[status]}`}
    >
      {status}
    </span>
  );
};

export default ClientDashboard;
