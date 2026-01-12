import { useEffect, useState } from "react";
import api from "../../api/axios";
import Header from "../../common/Header";
import AppointmentCard from "../../common/AppointmentCard ";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export type Appointment = {
  id: number;
  startAt: string;
  endAt: string;
  purpose?: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED";
  consultant: {
    id: number;
    name: string;
    email?: string;
  };
};

type Tab = "UPCOMING" | "HISTORY";

const MyAppointments = () => {
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [history, setHistory] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("UPCOMING");

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get("/appointment/me"),
      api.get("/appointment/me/history"),
    ])
      .then(([upRes, histRes]) => {
        setUpcoming(upRes.data);
        setHistory(histRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (appt: Appointment) => {
    try {
      await api.patch(`/appointment/cancel/${appt.id}`);

      setUpcoming((prev) => prev.filter((a) => a.id !== appt.id));
      setHistory((prev) => [{ ...appt, status: "CANCELLED" }, ...prev]);

      toast.success("Appointment cancelled successfully");
    } catch {
      toast.error("Failed to cancel appointment");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center py-16 text-sm text-gray-500">
          Loading appointments...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* PAGE HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center justify-center flex-row gap-6">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="text-sm px-3 py-2 rounded-md border bg-white hover:bg-gray-100"
              >
                ←
              </button>
            </div>
            <div className="flex items-start justify-center flex-col">
              <h1 className="text-2xl font-semibold text-gray-900">
                My Appointments
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                View and manage your appointments
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/create-appointment")}
            className="px-4 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Book Appointment
          </button>
        </div>

        {/* TABS */}
        <div className="flex gap-6 border-b mb-8">
          <TabButton
            active={activeTab === "UPCOMING"}
            onClick={() => setActiveTab("UPCOMING")}
          >
            Upcoming ({upcoming.length})
          </TabButton>

          <TabButton
            active={activeTab === "HISTORY"}
            onClick={() => setActiveTab("HISTORY")}
          >
            History ({history.length})
          </TabButton>
        </div>

        {/* CONTENT */}
        <div className="space-y-4">
          {activeTab === "UPCOMING" && (
            <>
              {upcoming.length === 0 ? (
                <EmptyState
                  text="No upcoming appointments"
                  action={() => navigate("/create-appointment")}
                />
              ) : (
                upcoming.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appt={appt}
                    label="Upcoming"
                    onCancel={handleCancel}
                  />
                ))
              )}
            </>
          )}

          {activeTab === "HISTORY" && (
            <>
              {history.length === 0 ? (
                <EmptyState text="No appointment history" />
              ) : (
                history.map((appt) => (
                  <AppointmentCard
                    key={appt.id}
                    appt={appt}
                    label="Completed"
                    muted
                  />
                ))
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

/* ------------------ SMALL COMPONENTS ------------------ */

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`pb-3 text-sm font-medium transition border-b-2
      ${
        active
          ? "border-emerald-600 text-emerald-600"
          : "border-transparent text-gray-500 hover:text-gray-700"
      }
    `}
  >
    {children}
  </button>
);

const EmptyState = ({
  text,
  action,
}: {
  text: string;
  action?: () => void;
}) => (
  <div className="bg-white border rounded-xl py-16 text-center">
    <p className="text-sm text-gray-500 mb-4">{text}</p>
    {action && (
      <button
        onClick={action}
        className="px-4 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
      >
        Book Appointment
      </button>
    )}
  </div>
);

export default MyAppointments;
