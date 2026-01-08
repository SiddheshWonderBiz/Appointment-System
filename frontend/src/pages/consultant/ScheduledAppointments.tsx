import { useEffect, useState } from "react";
import api from "../../api/axios";
import Header from "../../common/Header";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

type Appointment = {
  id: number;
  startAt: string;
  endAt: string;
  status: "SCHEDULED" | "COMPLETED";
  client: {
    name: string;
  };
  purpose?: string;
};

const ScheduledAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
  

  useEffect(() => {
    api
      .get("/appointment/consultant")
      .then((res) => {
        const confirmed = res.data.filter(
          (a: Appointment) => a.status === "SCHEDULED"
        );
        setAppointments(confirmed);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleComplete = async (id: number) => {
    const ok = window.confirm("Mark this appointment completed?");
    if (!ok) return;

    try {
      await api.patch(`/appointment/complete/${id}`);

      setAppointments((prev) => prev.filter((appt) => appt.id !== id));

      toast.success("Appointments completed successfully")
    } catch {
      toast.error("Failed to complete appointment");
    }
  };
    if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
               <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            ←
          </button>

          <h2 className="text-2xl font-semibold">Scheduled Appointments</h2>
        </div>

        {appointments.length === 0 ? (
          <p className="text-gray-500">No scheduled appointments</p>
        ) : (
          <div className="space-y-4">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white border rounded-xl p-5"
              >
                <p className="font-semibold">
                  {appt.client.name}
                </p>

                <p className="text-sm text-gray-600">
                  {new Date(appt.startAt).toLocaleString()} –{" "}
                  {new Date(appt.endAt).toLocaleTimeString()}
                </p>

                {appt.purpose && (
                  <p className="text-sm text-gray-500 mt-1">
                    Purpose: {appt.purpose}
                  </p>
                )}

                <button
                  onClick={() => handleComplete(appt.id)}
                  className="mt-4 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Mark as Completed
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default ScheduledAppointments;



