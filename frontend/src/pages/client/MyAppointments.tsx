import { useEffect, useState } from "react";
import api from "../../api/axios";

type Appointment = {
  id: number;
  startAt: string; // UTC
  endAt: string;   // UTC
  purpose?: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
  consultant: {
    name: string;
    specialty?: string;
  };
};

const formatDate = (utc: string) => {
  return new Date(utc).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (utc: string) => {
  return new Date(utc).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const MyAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/appointment/my")
      .then((res) => setAppointments(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading appointments...</div>;
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No appointments booked yet
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-4">My Appointments</h2>

      <div className="space-y-3">
        {appointments.map((appt) => {
          const isPast = new Date(appt.endAt) < new Date();

          return (
            <div
              key={appt.id}
              className={`border rounded p-3 flex justify-between items-center ${
                isPast ? "bg-gray-50 text-gray-500" : "bg-emerald-50"
              }`}
            >
              <div>
                 {/* Consultant Name & Specialty */}
                <p className="font-medium">
                  {appt.consultant.name}{" "}
                  {appt.consultant.specialty &&
                    `(${appt.consultant.specialty})`}
                </p>

                {/* Date & Time */}
                <p className="text-sm">
                  {formatDate(appt.startAt)} •{" "}
                  {formatTime(appt.startAt)} – {formatTime(appt.endAt)}
                </p>

                {/* Purpose */}
                {appt.purpose && (
                  <p className="text-xs text-gray-600 mt-1">
                    Purpose: {appt.purpose}
                  </p>
                )}

                {/* Status */}
                <p className="text-xs mt-1">
                  Status:{" "}
                  <span
                    className={`px-1 rounded ${
                      appt.status === "CONFIRMED"
                        ? "bg-emerald-500 text-white"
                        : appt.status === "PENDING"
                        ? "bg-yellow-400 text-white"
                        : "bg-red-500 text-white"
                                    
                    }`}
                  >
                    {appt.status}
                  </span>
                </p>
              </div>

              {/* Status Badge */}
              <span
                className={`text-xs px-2 py-1 rounded ${
                  isPast ? "bg-gray-200" : "bg-emerald-500 text-white"
                }`}
              >
                {isPast ? "Completed" : "Upcoming"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyAppointments;
