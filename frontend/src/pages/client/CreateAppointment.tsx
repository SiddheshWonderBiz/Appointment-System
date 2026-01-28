import { useEffect, useState } from "react";
import api from "../../api/axios";
import Header from "../../common/Header";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

/* ================= TYPES ================= */

type SlotStatus = "FREE" | "LOCKED" | "BOOKED";

type Consultant = {
  id: number;
  name: string;
};

type Slot = {
  start: string;
  end: string;
  status: SlotStatus;
  lockedByMe?: boolean;
  expiresIn?: number;
};

/* ================= TIME HELPERS ================= */

// ⚠️ DO NOT CHANGE — correct IST logic
const getNowISTTimestamp = () => {
  const now = new Date();
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const istOffset = 5.5 * 60 * 60000;
  return utcTime + istOffset;
};

const formatTimeIST = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });

const formatTimer = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

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
  const [locking, setLocking] = useState(false);

  const [lockExpiresAt, setLockExpiresAt] = useState<number | null>(null);
  const [timer, setTimer] = useState<number>(0);

  const navigate = useNavigate();

  /* ================= RESTORE SESSION ================= */

  useEffect(() => {
    const savedConsultant = sessionStorage.getItem("consultantId");
    const savedDate = sessionStorage.getItem("date");

    if (savedConsultant) setConsultantId(Number(savedConsultant));
    if (savedDate) setDate(savedDate);
  }, []);

  /* ================= LOAD CONSULTANTS ================= */

  useEffect(() => {
    api.get("/consultant/list").then((res) => {
      setConsultants(res.data);
    });
  }, []);

  /* ================= LOAD AVAILABILITY ================= */

  const loadAvailability = async () => {
    if (!consultantId || !date) return;

    setLoadingSlots(true);
    try {
      const res = await api.get(
        `/appointment/availability/${consultantId}`,
        { params: { date } }
      );
      setSlots(res.data);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    setSlots([]);
    setSelectedSlot(null);
    setLockExpiresAt(null);
    setTimer(0);
    loadAvailability();
  }, [consultantId, date]);

  /* ================= SLOT SYNC EFFECT ================= */

  useEffect(() => {
    const mine = slots.find(
      (s) => s.status === "LOCKED" && s.lockedByMe
    );

    if (!mine || mine.expiresIn === undefined) {
      setSelectedSlot(null);
      setLockExpiresAt(null);
      setTimer(0);
      return;
    }

    setSelectedSlot(mine);
    setLockExpiresAt(Date.now() + mine.expiresIn * 1000);
    setTimer(mine.expiresIn);
  }, [slots]);

  /* ================= LOCK COUNTDOWN ================= */

  useEffect(() => {
    if (!lockExpiresAt) return;

    const interval = window.setInterval(() => {
      const remaining = Math.floor((lockExpiresAt - Date.now()) / 1000);

      if (remaining <= 0) {
        window.clearInterval(interval);
        setSelectedSlot(null);
        setLockExpiresAt(null);
        setTimer(0);
        toast.info("Slot released");
        loadAvailability();
      } else {
        setTimer(remaining);
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [lockExpiresAt]);

  /* ================= FILTER PAST SLOTS ================= */

  const visibleSlots = slots.filter((slot) => {
    if (date !== todayIST) return true;

    const nowIST = getNowISTTimestamp();
    const slotStartIST =
      new Date(slot.start).getTime() +
      new Date(slot.start).getTimezoneOffset() * 60000 +
      5.5 * 60 * 60000;

    return slotStartIST > nowIST;
  });

  /* ================= LOCK SLOT ================= */

  const lockSlot = async (slot: Slot) => {
    if (slot.status !== "FREE") return;

    try {
      setLocking(true);
      setSelectedSlot(null);
      setLockExpiresAt(null);
      setTimer(0);

      await api.post("/appointment/lock-slot", {
        consultantId,
        startAt: slot.start,
      });

      await loadAvailability();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Slot unavailable");
      loadAvailability();
    } finally {
      setLocking(false);
    }
  };

  /* ================= SLOT STYLE ================= */

  const slotStyle = (slot: Slot) => {
    if (slot.status === "BOOKED")
      return "bg-gray-200 text-gray-400 cursor-not-allowed";

    if (slot.status === "LOCKED" && !slot.lockedByMe)
      return "bg-yellow-100 text-yellow-800 cursor-not-allowed";

    if (selectedSlot?.start === slot.start)
      return "bg-emerald-600 text-white";

    return "bg-white hover:bg-gray-100";
  };

  /* ================= SUBMIT ================= */

  const submit = async () => {
    if (!selectedSlot || !lockExpiresAt || timer <= 0) {
      toast.error("Slot lock expired. Please reselect slot.");
      return;
    }

    if (!consultantId) {
      toast.info("Select consultant");
      return;
    }

    try {
      await api.post("/appointment/create", {
        consultantId,
        startAt: selectedSlot.start,
        endAt: selectedSlot.end,
        purpose,
      });

      sessionStorage.removeItem("consultantId");
      sessionStorage.removeItem("date");

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
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
          >
            ←
          </button>
          <h1 className="text-2xl font-semibold">Create Appointment</h1>
        </div>

        <div className="bg-white border rounded-xl p-8 space-y-6">
          {/* Consultant */}
          <select
            className="w-full p-3 border rounded-md"
            value={consultantId ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value) {
                sessionStorage.setItem("consultantId", value);
                setConsultantId(Number(value));
              } else {
                sessionStorage.removeItem("consultantId");
                setConsultantId(null);
              }
              sessionStorage.removeItem("date");
              setDate("");
            }}
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
            disabled={!consultantId}
            min={todayIST}
            value={date}
            onChange={(e) => {
              sessionStorage.setItem("date", e.target.value);
              setDate(e.target.value);
            }}
            className="w-full p-3 border rounded-md disabled:bg-gray-100"
          />

          {/* Slots */}
          {loadingSlots ? (
            <p className="text-gray-500">Loading slots…</p>
          ) : visibleSlots.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {visibleSlots.map((slot) => {
                const isSelected =
                  selectedSlot?.start === slot.start;

                return (
                  <button
                    key={slot.start}
                    disabled={
                      locking ||
                      slot.status === "BOOKED" ||
                      (slot.status === "LOCKED" && !slot.lockedByMe)
                    }
                    onClick={() => lockSlot(slot)}
                    className={`p-2 border rounded-md transition ${slotStyle(
                      slot
                    )}`}
                  >
                    {formatTimeIST(slot.start)} –{" "}
                    {formatTimeIST(slot.end)}

                    {isSelected && timer > 0 && (
                      <div className="text-xs mt-1">
                        ⏳ {formatTimer(timer)}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">No slots available</p>
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
