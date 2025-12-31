import { useEffect, useState } from "react";
import api from "../../api/axios";
import Header from "../../common/Header";
import AppointmentCard from "./../../common/AppointmentCard ";
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
      api.get("/appointment/me"), // upcoming (scheduled + pending)
      api.get("/appointment/me/history"), // cancelled + rejected + completed
    ])
      .then(([upRes, prevRes]) => {
        setUpcoming(upRes.data);
        setPrevious(prevRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

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
        <section>
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              ← 
            </button>

            <h2 className="text-2xl font-semibold text-gray-800">
              Upcoming Appointments
            </h2>
          </div>

          {upcoming.length === 0 ? (
            <p className="text-gray-500">No upcoming appointments</p>
          ) : (
            <div className="space-y-4">
              {upcoming.map((appt) => (
                <AppointmentCard key={appt.id} appt={appt} label="Upcoming" />
              ))}
            </div>
          )}
        </section>

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
