import * as React from "react";
import { createPortal } from "react-dom";
import { IconRenderer } from "@/utils/icon-mapper";

export function Drawer({ isOpen, onClose, title, children, footer }) {
  const [mounted, setMounted] = React.useState(false);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Allow a brief delay for transition to kick in
      const timer = setTimeout(() => setShow(true), 10);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
      const timer = setTimeout(() => {
        document.body.style.overflow = "";
      }, 300); // match duration-300
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center md:hidden" role="dialog" aria-modal="true">
      {/* Backdrop overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 transition-opacity duration-300 ease-out-in ${
          show ? "opacity-100" : "opacity-0"
        }`} 
        onClick={onClose} 
      />

      {/* Sheet content */}
      <div 
        className={`relative w-full max-h-[85vh] bg-white rounded-t-2xl shadow-2xl flex flex-col z-10 transition-transform duration-300 ease-out-in transform ${
          show ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Notch handle */}
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-outline-variant/60 shrink-0" />

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-outline-variant/20 shrink-0">
          <h3 className="text-lg font-bold text-primary">{title}</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low transition-colors"
          >
            <IconRenderer name="close" className="text-[20px]" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 flex flex-col items-center flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-6 border-t border-outline-variant/20 flex gap-4 bg-white shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
