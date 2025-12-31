import { useEffect, useState } from "react";
import api from "../../api/axios";
import Header from "../../common/Header";
import { useNavigate } from "react-router-dom";


type Consultant = {
  id: number;
  name: string;
  specialty?: string;
};

type Slot = {
  start: string;
  end: string;
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
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/consultant/list").then((res) => {
      setConsultants(res.data);
    });
  }, []);

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

  const submit = async () => {
    if (!consultantId || !date || !selectedSlot) {
      alert("Please select consultant, date and time slot");
      return;
    }

    try {
      await api.post("/appointment/create", {
        consultantId,
        startAt: selectedSlot.start,
        endAt: selectedSlot.end,
        purpose,
      });

      alert("Appointment created successfully");
      setDate("");
      setSlots([]);
      setSelectedSlot(null);
      setPurpose("");
    } catch {
      alert("Failed to create appointment");
    }
  };

  return (
    <>
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border p-8 animate-slideUp">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              ←
            </button>

            <h2 className="text-2xl font-semibold text-gray-800">
              Create Appointment
            </h2>
          </div>
          <p className="text-gray-500 mb-8">
            Choose a consultant, date, and time slot
          </p>

          {/* CONSULTANT */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Consultant
            </label>
            <select
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
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
          </div>

          {/* DATE */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />
          </div>

          {/* SLOTS */}
          {slots.length > 0 && (
            <div className="mb-8">
              <p className="font-medium text-gray-800 mb-3">
                Available Time Slots
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slots.map((slot, index) => {
                  const isSelected = selectedSlot?.start === slot.start;

                  return (
                    <button
                      key={`${slot.start}-${slot.end}-${index}`}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 text-sm rounded-lg border transition
                      ${
                        isSelected
                          ? "bg-emerald-500 text-white border-emerald-500 shadow"
                          : "bg-white hover:bg-emerald-50 hover:border-emerald-300"
                      }
                    `}
                    >
                      {formatTime(slot.start)} – {formatTime(slot.end)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PURPOSE */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose
            </label>
            <input
              placeholder="Briefly describe the purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
            />
          </div>

          {/* SUBMIT */}
          <button
            onClick={submit}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 rounded-lg transition shadow-md"
          >
            Confirm Appointment
          </button>
        </div>
      </div>
    </>
  );
};

export default CreateAppointment;
