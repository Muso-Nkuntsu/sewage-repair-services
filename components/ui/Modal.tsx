"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon } from "./Icons";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

/** Accessible modal built on the native <dialog> element (Esc closes it, focus is trapped). */
export function Modal({ open, title, onClose, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      aria-labelledby="modal-title"
      className="w-[calc(100%-2rem)] max-w-lg rounded-xl p-0 shadow-xl backdrop:bg-navy/50"
    >
      {open ? (
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 id="modal-title" className="text-lg font-semibold text-navy">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1 text-muted hover:bg-slate-100 hover:text-navy"
              aria-label="Close"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="px-5 py-4">{children}</div>
        </div>
      ) : null}
    </dialog>
  );
}
