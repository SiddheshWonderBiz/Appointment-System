import { useEffect, useState } from "react";
import api from "../../api/axios";

type Consultant = {
  id: number;
  name: string;
  specialty?: string;
};

type Slot = {
  start: string; // "09:00"
  end: string; // "09:30"
};
const formatTime = (utcIso: string) => {
  const date = new Date(utcIso);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const CreateAppointment = () => {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [consultantId, setConsultantId] = useState<number | null>(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [purpose, setPurpose] = useState("");

  // Fetch consultants
  useEffect(() => {
    api.get("/consultant/list").then((res) => {
      setConsultants(res.data);
    });
  }, []);

  // Fetch availability slots
  useEffect(() => {
    if (!consultantId || !date) return;

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
      });
  }, [consultantId, date]);

  // Submit appointment
  const submit = async () => {
    if (!consultantId || !date || !selectedSlot) {
      alert("Please select consultant, date and time slot");
      return;
    }

    const startAt = selectedSlot.start;
    const endAt = selectedSlot.end;

    try {
      await api.post("/appointment/create", {
        consultantId,
        startAt,
        endAt,
        purpose,
      });

      alert("Appointment created successfully");

      // Optional reset
      setDate("");
      setSlots([]);
      setSelectedSlot(null);
      setPurpose("");
    } catch (error) {
      alert("Failed to create appointment");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold mb-4">Create Appointment</h2>

      {/* Consultant */}
      <select
        className="border p-2 rounded w-full mb-3"
        value={consultantId ?? ""}
        onChange={(e) => setConsultantId(Number(e.target.value))}
      >
        <option value="">Select Consultant</option>
        {consultants.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} {c.specialty && `(${c.specialty})`}
          </option>
        ))}
      </select>

      {/* Date */}
      <input
        type="date"
        value={date}
        min={new Date().toISOString().split("T")[0]}
        onChange={(e) => setDate(e.target.value)}
        className="border p-2 rounded w-full mb-3"
      />

      {/* Slots */}
      {slots.length > 0 && (
        <div className="mb-3">
          <p className="font-medium mb-2">Available Time Slots</p>

          <div className="grid grid-cols-3 gap-2">
            {slots.map((slot, index) => (
              <button
                key={`${slot.start}-${slot.end}-${index}`}
                onClick={() => setSelectedSlot(slot)}
                className={`border rounded py-2 text-sm ${
                  selectedSlot?.start === slot.start
                    ? "bg-emerald-500 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {formatTime(slot.start)} - {formatTime(slot.end)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Purpose */}
      <input
        placeholder="Purpose"
        value={purpose}
        onChange={(e) => setPurpose(e.target.value)}
        className="border p-2 rounded w-full mb-3"
      />

      {/* Submit */}
      <button
        onClick={submit}
        className="bg-emerald-500 text-white py-2 rounded w-full"
      >
        Create Appointment
      </button>
    </div>
  );
};

export default CreateAppointment;
