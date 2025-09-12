import { useEffect } from "react";

function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}>
        <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          <div className="mt-3">{children}</div>
          {footer && (
            <div className="mt-5 flex justify-end gap-2">{footer}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Modal;
