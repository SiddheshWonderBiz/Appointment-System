import { useEffect, useState } from "react";
import api from "../../api/axios";
import Header from "../../common/Header";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

/* ================= TYPES ================= */

type Consultant = {
  id: number;
  name: string;
};

type Slot = {
  start: string; // ISO UTC from backend
  end: string;
};

/* ================= TIME HELPERS ================= */

/**
 * Current IST timestamp (milliseconds)
 * No locale parsing → no Invalid Date
 */
const getNowISTTimestamp = () => {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 60 * 60000; // IST = UTC + 5:30
  return utcTime + istOffset;
};

/**
 * Slot start timestamp (UTC from backend)
 */
const getSlotStartTimestamp = (iso: string) => {
  return new Date(iso).getTime();
};

/**
 * Format slot time for UI (IST only for display)
 */
const formatTimeIST = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

/**
 * Today's date in IST (yyyy-mm-dd)
 */
const todayIST = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
}).format(new Date());

/* ================= COMPONENT ================= */

const CreateAppointment = () => {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [consultantId, setConsultantId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [purpose, setPurpose] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  const navigate = useNavigate();

  /* ================= LOAD CONSULTANTS ================= */

  useEffect(() => {
    api.get("/consultant/list").then((res) => {
      setConsultants(res.data);
    });
  }, []);

  /* ================= LOAD SLOTS ================= */

  useEffect(() => {
    if (!consultantId || !date) return;

    setLoadingSlots(true);
    api
      .get(`/appointment/availability/${consultantId}`, {
        params: { date },
      })
      .then((res) => {
        console.log("📦 RAW SLOTS FROM BACKEND:", res.data);
        setSlots(res.data);
        setSelectedSlot(null);
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [consultantId, date]);

  /* ================= FILTER LOGIC ================= */

  const visibleSlots = slots.filter((slot, index) => {
    // Future dates → show all slots
    if (date !== todayIST) {
      
      return true;
    }

    const nowIST = getNowISTTimestamp();
    const slotStart = getSlotStartTimestamp(slot.start);

    

    return slotStart > nowIST;
  });

  /* ================= SUBMIT ================= */

  const submit = async () => {
    if (!consultantId || !date || !selectedSlot) {
      toast.info("Select consultant, date and time slot");
      return;
    }

    try {
      await api.post("/appointment/create", {
        consultantId,
        startAt: selectedSlot.start,
        endAt: selectedSlot.end,
        purpose,
      });

      toast.success("Appointment booked successfully");
      navigate("/my-appointments");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Booking failed");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-semibold mb-6">
          Create Appointment
        </h1>

        <div className="bg-white border rounded-xl p-8 space-y-6">
          {/* Consultant */}
          <select
            className="w-full p-3 border rounded-md"
            value={consultantId ?? ""}
            onChange={(e) => setConsultantId(Number(e.target.value))}
          >
            <option value="">Select consultant</option>
            {consultants.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Date */}
          <input
            type="date"
            min={todayIST}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 border rounded-md"
          />

          {/* Slots */}
          {loadingSlots ? (
            <p className="text-gray-500">Loading slots…</p>
          ) : visibleSlots.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {visibleSlots.map((slot) => (
                <button
                  key={slot.start}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-2 border rounded-md transition ${
                    selectedSlot?.start === slot.start
                      ? "bg-emerald-600 text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {formatTimeIST(slot.start)} –{" "}
                  {formatTimeIST(slot.end)}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              No slots available for selected date
            </p>
          )}

          {/* Purpose */}
          <input
            placeholder="Purpose (optional)"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full p-3 border rounded-md"
          />

          {/* Submit */}
          <button
            onClick={submit}
            className="w-full bg-emerald-600 text-white py-3 rounded-md"
          >
            Confirm Appointment
          </button>
        </div>
      </main>
    </div>
  );
};

export default CreateAppointment;
