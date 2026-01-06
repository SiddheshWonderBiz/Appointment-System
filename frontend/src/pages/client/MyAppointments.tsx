import { useEffect, useState } from "react";
import api from "../../api/axios";
import Header from "../../common/Header";
import AppointmentCard from "../../common/AppointmentCard ";
import { useNavigate } from "react-router-dom";

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

const MyAppointments = () => {
  const [upcoming, setUpcoming] = useState<Appointment[]>([]);
  const [previous, setPrevious] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get("/appointment/me"),
      api.get("/appointment/me/history"),
    ])
      .then(([upRes, prevRes]) => {
        setUpcoming(upRes.data);
        setPrevious(prevRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (appt: Appointment) => {
    try {
      await api.patch(`/appointment/cancel/${appt.id}`);

      // Remove from upcoming
      setUpcoming((prev) => prev.filter((a) => a.id !== appt.id));

      // Add to previous with CANCELLED status
      setPrevious((prev) => [{ ...appt, status: "CANCELLED" }, ...prev]);
    } catch (err) {
      console.error(err);
      alert("Failed to cancel appointment");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16 text-gray-500">
        Loading appointments...
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        {/* UPCOMING */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              ←
            </button>
            <h2 className="text-2xl font-semibold">Upcoming Appointments</h2>
          </div>

          {upcoming.length === 0 ? (
            <p className="text-gray-500">No upcoming appointments</p>
          ) : (
            <div className="space-y-4">
              {upcoming.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appt={appt}
                  label="Upcoming"
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
        </section>

        {/* PREVIOUS */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Previous Appointments</h2>

          {previous.length === 0 ? (
            <p className="text-gray-500">No previous appointments</p>
          ) : (
            <div className="space-y-4">
              {previous.map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appt={appt}
                  label="Completed"
                  muted
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default MyAppointments;
