import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Calendar, List, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../api/axios";
import Header from "../../common/Header";

/* ---------------- TYPES ---------------- */

type AppointmentStatus =
  | "PENDING"
  | "SCHEDULED"
  | "CANCELLED"
  | "REJECTED"
  | "COMPLETED";

type Appointment = {
  id: number;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  client: {
    name: string;
  };
};

/* ---------------- PAGE ---------------- */

const ConsultantDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [current, setCurrent] = useState<Appointment[]>([]);
  const [history, setHistory] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [currentRes, historyRes] = await Promise.all([
          api.get("/appointment/consultant"),
          api.get("/appointment/consultant/history"),
        ]);

        setCurrent(currentRes.data);
        setHistory(historyRes.data);
      } catch (err) {
        console.error("Failed to load consultant dashboard", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  /* ---------------- STATS ---------------- */

  const pendingCount = current.filter((a) => a.status === "PENDING").length;
  const scheduledCount = current.filter((a) => a.status === "SCHEDULED").length;
  const completedCount = history.filter((a) => a.status === "COMPLETED").length;

  /* ---------------- TODAY LOGIC ---------------- */

  const todayISO = new Date().toISOString().split("T")[0];

  const todaysAppointments = current.filter(
    (a) => a.status === "SCHEDULED" && a.startAt.startsWith(todayISO)
  );

  

  const formatTime12 = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

  

  const actionCardColors: Record<string, string> = {
    "Pending Requests": "bg-yellow-50 text-yellow-600",
    "Scheduled Appointments": "bg-emerald-50 text-emerald-600",
    History: "bg-blue-50 text-blue-600",
  };

 

  const quickActions = [
    {
      icon: <List size={18} />,
      title: "Pending Requests",
      description: "Approve or reject appointments",
      navigateTo: "/consultant/appointments/pending",
    },
    {
      icon: <Calendar size={18} />,
      title: "Scheduled Appointments",
      description: "View confirmed bookings",
      navigateTo: "/consultant/appointments/scheduled",
    },
    {
      icon: <CheckCircle size={18} />,
      title: "History",
      description: "Completed & cancelled",
      navigateTo: "/consultant/appointments/history",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-xl text-gray-500">Consultant Dashboard</h1>
          <p className="text-2xl sm:text-3xl font-semibold text-gray-900 font-serif">
            Welcome back, <span className="text-emerald-600 ">{user?.name}</span>
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard label="Pending Requests" value={pendingCount} />
          <StatCard label="Scheduled & Upcoming" value={scheduledCount} />
          <StatCard label="Completed" value={completedCount} />
        </div>

        {/* QUICK ACTIONS */}
        <section className="bg-white border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {quickActions.map((card) => (
              <ActionCard
                key={card.title}
                icon={card.icon}
                title={card.title}
                description={card.description}
                onClick={() => navigate(card.navigateTo)}
                colorClass={actionCardColors[card.title]}
              />
            ))}
          </div>
        </section>

        {/* TODAY APPOINTMENTS */}
        <section className="bg-white border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Today’s Appointments</h2>

          {loading ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : todaysAppointments.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-500">
              No appointments scheduled for today
            </div>
          ) : (
            <div className="space-y-4">
              {todaysAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="flex justify-between items-center border rounded-lg px-4 py-3 hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{appt.client.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatTime12(appt.startAt)} – {formatTime12(appt.endAt)}
                    </p>
                  </div>

                  <StatusBadge status={appt.status} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

/* ---------------- COMPONENTS ---------------- */

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
  onClick,
  colorClass = "bg-gray-50 text-gray-600",
}: any) => (
  <div
    onClick={onClick}
    className="cursor-pointer border rounded-lg p-4 hover:border-emerald-500 transition"
  >
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 flex items-center justify-center rounded-md ${colorClass}`}>
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
    SCHEDULED: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-gray-200 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return <span className={`text-xs font-medium px-2 py-1 rounded-md ${map[status]}`}>{status}</span>;
};

export default ConsultantDashboard;
