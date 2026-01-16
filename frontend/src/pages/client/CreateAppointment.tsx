import { useEffect, useState } from "react";
import api from "../../api/axios";
import Header from "../../common/Header";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

/* ---------------- TYPES ---------------- */

type Consultant = {
  id: number;
  name: string;
  specialty?: string;
};

type Slot = {
  start: string;
  end: string;
};

/* ---------------- HELPERS ---------------- */

// Format time ALWAYS in IST
const formatTime = (utcIso: string) => {
  return new Date(utcIso).toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

// Today date in IST (for date picker min)
const todayIST = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());


// Sunday check (IST-safe)
const isSunday = (dateStr: string) => {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.getDay() === 0;
};

/* ---------------- COMPONENT ---------------- */

const CreateAppointment = () => {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [consultantId, setConsultantId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [purpose, setPurpose] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  const navigate = useNavigate();

  /* ---------------- LOAD CONSULTANTS ---------------- */

  useEffect(() => {
    api.get("/consultant/list").then((res) => {
      setConsultants(res.data);
    });
  }, []);

  /* ---------------- LOAD AVAILABILITY ---------------- */

  useEffect(() => {
    if (!consultantId || !date) return;

    setLoadingSlots(true);

    api
      .get(`/appointment/availability/${consultantId}`, {
        params: { date },
      })
      .then((res) => {
        setSlots(res.data);
        setSelectedSlot(null);
      })
      .catch(() => {
        setSlots([]);
        setSelectedSlot(null);
      })
      .finally(() => setLoadingSlots(false));
  }, [consultantId, date]);

  /* ---------------- SUBMIT ---------------- */

  const submit = async () => {
    if (isSunday(date)) {
      toast.info("Appointments cannot be booked on Sundays");
      return;
    }

    if (!consultantId || !date || !selectedSlot) {
      toast.info("Please select consultant, date and time slot");
      return;
    }

    try {
      await api.post("/appointment/create", {
        consultantId,
        startAt: selectedSlot.start,
        endAt: selectedSlot.end,
        purpose,
      });

      toast.success(
        "Appointment created successfully. Confirmation email sent."
      );
      navigate("/my-appointments");
    } catch {
      toast.error("Failed to create appointment");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-sm px-3 py-2 rounded-md border bg-white hover:bg-gray-100"
          >
            ←
          </button>

          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Create Appointment
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Select consultant, date, and preferred time slot
            </p>
          </div>
        </div>

        {/* FORM */}
        <div className="bg-white border rounded-xl p-8 space-y-8">
          {/* CONSULTANT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Consultant
            </label>
            <select
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-emerald-500"
              value={consultantId ?? ""}
              onChange={(e) => setConsultantId(Number(e.target.value))}
            >
              <option value="">Select consultant</option>
              {consultants.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.specialty && `(${c.specialty})`}
                </option>
              ))}
            </select>
          </div>

          {/* DATE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              min={todayIST}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* TIME SLOTS */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              Available Time Slots
            </p>

            {loadingSlots ? (
              <p className="text-sm text-gray-500">Loading slots...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-gray-500">
                No slots available for selected date
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {slots.map((slot) => {
                  const selected = selectedSlot?.start === slot.start;

                  return (
                    <button
                      key={slot.start}
                      onClick={() => setSelectedSlot(slot)}
                      className={`text-sm px-3 py-2 rounded-md border transition
                        ${
                          selected
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white hover:border-emerald-400 hover:bg-emerald-50"
                        }
                      `}
                    >
                      {formatTime(slot.start)} – {formatTime(slot.end)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* PURPOSE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose (optional)
            </label>
            <input
              placeholder="Brief reason for appointment"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-sm rounded-md border bg-white hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="px-5 py-2.5 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Confirm Appointment
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateAppointment;
