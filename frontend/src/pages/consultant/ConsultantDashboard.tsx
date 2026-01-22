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

/* ---------------- DATE HELPERS (DEBUG ENABLED) ---------------- */

const parseMMDDYYToDate = (dateStr: string): Date => {
  console.log("🟡 RAW startAt from backend:", dateStr);

  // Detect ISO format automatically
  if (dateStr.includes("T")) {
    const isoDate = new Date(dateStr);
    console.log("🟢 Parsed as ISO:", isoDate.toString());
    return isoDate;
  }

  const parts = dateStr.split(" ");
  const datePart = parts[0];
  const timePart = parts[1];
  const meridian = parts[2];

  const [month, day, year] = datePart.split("/").map(Number);
  const fullYear = 2000 + year;

  let hours = 0;
  let minutes = 0;

  if (timePart) {
    [hours, minutes] = timePart.split(":").map(Number);

    if (meridian) {
      if (meridian === "PM" && hours < 12) hours += 12;
      if (meridian === "AM" && hours === 12) hours = 0;
    }
  }

  const parsedDate = new Date(fullYear, month - 1, day, hours, minutes);
  console.log("🟢 Parsed as MM/DD/YY:", parsedDate.toString());

  return parsedDate;
};

const isSameDay = (d1: Date, d2: Date) => {
  console.log("🔵 Comparing Dates:");
  console.log("   Appointment Date:", d1.toString());
  console.log("   Today Date:", d2.toString());

  const result =
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  console.log("   👉 isSameDay result:", result);
  return result;
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

        console.log("📦 CURRENT APPOINTMENTS RAW:", currentRes.data);
        console.log("📦 HISTORY APPOINTMENTS RAW:", historyRes.data);

        setCurrent(currentRes.data);
        setHistory(historyRes.data);
      } catch (err) {
        console.error("❌ Failed to load consultant dashboard", err);
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

  /* ---------------- TODAY LOGIC (FULL DEBUG) ---------------- */

  const today = new Date();
  console.log("🕒 TODAY (IST):", today.toString());

  const todaysAppointments = current.filter((a) => {
    console.log("──────── Checking Appointment ID:", a.id);
    console.log("Status:", a.status);

    if (a.status !== "SCHEDULED") {
      console.log("❌ Skipped (not SCHEDULED)");
      return false;
    }

    const appointmentDate = parseMMDDYYToDate(a.startAt);
    const isToday = isSameDay(appointmentDate, today);

    console.log("✅ Final decision (show?):", isToday);
    return isToday;
  });

  console.log("📌 TODAYS APPOINTMENTS FINAL:", todaysAppointments);

  /* ---------------- FORMAT TIME ---------------- */

  const formatTime12 = (dateStr: string) => {
    const date = parseMMDDYYToDate(dateStr);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

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
            Welcome back, <span className="text-emerald-600">{user?.name}</span>
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard label="Pending Requests" value={pendingCount} />
          <StatCard label="Scheduled & Upcoming" value={scheduledCount} />
          <StatCard label="Completed" value={completedCount} />
        </div>

        {/* TODAY APPOINTMENTS */}
        <section className="bg-white border rounded-xl p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Today’s Appointments
          </h2>

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
                  className="flex justify-between items-center border rounded-lg px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {appt.client.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime12(appt.startAt)} –{" "}
                      {formatTime12(appt.endAt)}
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

const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
  const map: Record<AppointmentStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    SCHEDULED: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-gray-200 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-md ${map[status]}`}>
      {status}
    </span>
  );
};

export default ConsultantDashboard;
