import { useEffect } from "react";

function Toast({ message, type = "success", onDone, timeout = 2500 }) {
  useEffect(() => {
    const id = setTimeout(() => onDone?.(), timeout);
    return () => clearTimeout(id);
  }, [onDone, timeout]);

  if (!message) return null;

  const styles =
    type === "error" ? "bg-rose-600 text-white" : "bg-emerald-600 text-white";

  return (
    <div>
      <div className={`rounded-lg px-4 py-2 shadow ${styles}`}>{message}</div>
    </div>
  );
}

export default Toast;
