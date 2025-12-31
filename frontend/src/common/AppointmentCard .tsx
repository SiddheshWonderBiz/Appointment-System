import { Appointment } from "../../src/pages/client/MyAppointments";

const formatDate = (utc: string) =>
  new Date(utc).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatTime = (utc: string) =>
  new Date(utc).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

const statusStyles: Record<string, string> = {
  CONFIRMED: "bg-emerald-100 text-emerald-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-200 text-gray-700",
  COMPLETED: "bg-blue-100 text-blue-700",
};

const AppointmentCard = ({
  appt,
  label,
  muted = false,
}: {
  appt: Appointment;
  label: string;
  muted?: boolean;
}) => {
  return (
    <div
      className={`border rounded-xl p-5 transition ${
        muted
          ? "bg-gray-50 text-gray-500"
          : "bg-white hover:shadow-md"
      }`}
    >
      {/* Consultant */}
      <h3 className="font-semibold text-gray-800">
        {appt.consultant.name}
      </h3>

      {/* Date & Time */}
      <p className="text-sm text-gray-600 mt-1">
        {formatDate(appt.startAt)} •{" "}
        {formatTime(appt.startAt)} –{" "}
        {formatTime(appt.endAt)}
      </p>

      {/* Purpose */}
      {appt.purpose && (
        <p className="text-xs text-gray-500 mt-2">
          Purpose: {appt.purpose}
        </p>
      )}

      {/* Status */}
      <div className="flex items-center gap-2 mt-3">
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${
            statusStyles[appt.status]
          }`}
        >
          {appt.status}
        </span>

        <span
          className={`text-xs px-2 py-1 rounded-full ${
            muted
              ? "bg-gray-200 text-gray-600"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

export default AppointmentCard;
