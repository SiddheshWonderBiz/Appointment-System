import { useEffect, useState } from "react";
import api from "../../api/axios";
import Header from "../../common/Header";
import { useNavigate } from "react-router-dom";
import AppointmentCard from "../../common/AppointmentCard ";

type AppointmentStatus = "ALL" | "COMPLETED" | "REJECTED" | "CANCELLED";

type Appointment = {
  id: number;
  startAt: string;
  endAt: string;
  purpose?: string;
  status: "COMPLETED" | "REJECTED" | "CANCELLED";
  client: {
    id: number;
    name: string;
    email?: string;
  };
};

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] =
    useState<AppointmentStatus>("ALL");

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/appointment/consultant/history")
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  }, []);

  const filteredAppointments =
    statusFilter === "ALL"
      ? appointments
      : appointments.filter(
          (appt) => appt.status === statusFilter
        );

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-gray-500">
        Loading appointment history...
      </div>
    );
  }

  return (
    <>
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header row */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            ←
          </button>

          <h2 className="text-2xl font-semibold">
            Previous Appointments
          </h2>
        </div>

        {/* ===== STATUS FILTER ===== */}
        <div className="flex gap-2 flex-wrap">
          {(["ALL", "COMPLETED", "REJECTED", "CANCELLED"] as AppointmentStatus[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 text-sm rounded-full border transition
                  ${
                    statusFilter === status
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                  }
                `}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* ===== LIST ===== */}
        {filteredAppointments.length === 0 ? (
          <p className="text-gray-500">
            No appointments found for selected status
          </p>
        ) : (
          <div className="space-y-4">
            {filteredAppointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appt={{
                  ...appt,
                  consultant: {
                    // AppointmentCard expects consultant,
                    // but here we show client
                    id: appt.client.id,
                    name: appt.client.name,
                    email: appt.client.email,
                  },
                }}
                label={appt.status}
                muted
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AppointmentHistory;
