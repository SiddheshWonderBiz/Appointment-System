import  { useEffect, useState } from "react";
import Header from "../../common/Header";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export type Appointment = {
  id: number;
  startAt: string;
  endAt: string;
  purpose?: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED" | "COMPLETED";
  client: {
    id: number;
    name: string;
    email?: string;
  };
};

const PendingAppointments = () => {
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleAccept = async (id: number) => {
    try {
      await api.patch(`/appointment/accept/${id}`);

      setPendingAppointments((prev) => prev.filter((appt) => appt.id !== id));
      toast.success("Accepted appointment successfully,  Status email sent to client")
    } catch (err) {
      toast.error("failed to fetch appointments");
    }
  };

  const handleReject = async (id: number) => {
    const ok = window.confirm("Reject this appointment?");
    if (!ok) return;

    try {
      await api.patch(`/appointment/reject/${id}`);
      setPendingAppointments((prev) => prev.filter((appt) => appt.id !== id));
      toast.success("Appointment rejected, Status email sent to client")
    } catch {
      toast.error("Failed to reject appointment");
    }
  };

  useEffect(() => {
    api
      .get("/appointment/consultant")
      .then((res) => {
        const pending = res.data.filter(
          (appt: Appointment) => appt.status === "PENDING"
        );
        setPendingAppointments(pending);
      })
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            ←
          </button>

          <h2 className="text-2xl font-semibold">Pending Appointments</h2>
        </div>
        {/* content */}
        {loading && <p className="text-gray-500">Loading appointments...</p>}

        {!loading && pendingAppointments.length === 0 && (
          <p className="text-gray-500">No pending appointments.</p>
        )}

        {!loading && pendingAppointments.length > 0 && (
          <div className="space-y-4">
            {pendingAppointments.map((appt) => (
              <div key={appt.id} className="bg-white border rounded-xl p-5">
                <p className="font-semibold text-gray-800">
                  {appt.client.name}
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  {new Date(appt.startAt).toLocaleString()} –{" "}
                  {new Date(appt.endAt).toLocaleTimeString()}
                </p>

                {appt.purpose && (
                  <p className="text-sm text-gray-500 mt-2">
                    Purpose: {appt.purpose}
                  </p>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleAccept(appt.id)}
                    className="px-4 py-1.5 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Accept
                  </button>

                  <button
                    onClick={() => handleReject(appt.id)}
                    className="px-4 py-1.5 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PendingAppointments;
