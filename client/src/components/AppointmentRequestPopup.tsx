import {
  createContext,
  useContext,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { ArrowUpRight, Phone, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import AppointmentRequestForm from "@/components/AppointmentRequestForm";

const PopupContext = createContext<
  ((trigger: HTMLButtonElement) => void) | null
>(null);

export function AppointmentPopupTrigger({
  onClick,
  children,
  ...props
}: ComponentProps<"button">) {
  const openPopup = useContext(PopupContext);
  if (!openPopup)
    throw new Error("AppointmentPopupTrigger requires AppointmentRequestPopup");
  return (
    <button
      {...props}
      type="button"
      aria-haspopup="dialog"
      onClick={event => {
        onClick?.(event);
        if (!event.defaultPrevented) openPopup(event.currentTarget);
      }}
    >
      {children}
    </button>
  );
}

export default function AppointmentRequestPopup({
  children,
  onOpen,
  onCall,
  onSchedulerOpen,
}: {
  children: ReactNode;
  onOpen?: () => void;
  onCall?: () => void;
  onSchedulerOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const title = useRef<HTMLHeadingElement>(null);

  function openPopup(trigger: HTMLButtonElement) {
    lastTrigger.current = trigger;
    onOpen?.();
    setOpen(true);
  }

  return (
    <PopupContext.Provider value={openPopup}>
      <Dialog open={open} onOpenChange={setOpen}>
        {children}
        <DialogContent
          showCloseButton={false}
          overlayClassName="z-[80] bg-plum/65 backdrop-blur-sm"
          className="manus-no-record z-[90] flex max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-none flex-col gap-0 overflow-hidden rounded-[1.5rem] border-plum/10 bg-white p-0 text-ink shadow-[0_24px_90px_rgba(53,17,61,0.3)] sm:w-full sm:max-w-[640px]"
          onOpenAutoFocus={event => {
            event.preventDefault();
            title.current?.focus();
          }}
          onCloseAutoFocus={event => {
            event.preventDefault();
            if (lastTrigger.current?.isConnected) {
              lastTrigger.current.focus({ preventScroll: true });
            } else {
              document
                .querySelector<HTMLButtonElement>(
                  'button[aria-label="Toggle navigation"]'
                )
                ?.focus({ preventScroll: true });
            }
          }}
        >
          <div className="relative shrink-0 border-b border-plum/10 bg-cream px-5 py-5 pr-16 sm:px-7 sm:pr-16">
            <p className="eyebrow text-orchid">
              Free consultation · no obligation
            </p>
            <DialogTitle
              ref={title}
              tabIndex={-1}
              className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-plum outline-none sm:text-3xl"
            >
              Request an Appointment
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-6 text-ink/65">
              Share your details and preferred time for a free implant
              consultation.
            </DialogDescription>
            <DialogClose
              className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full border border-plum/10 bg-white text-plum transition hover:bg-mist focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orchid"
              aria-label="Close appointment form"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </DialogClose>
          </div>
          <div
            data-appointment-popup-scroll
            className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] sm:px-7"
          >
            <AppointmentRequestForm />
            <div className="mt-5 border-t border-plum/10 pt-4">
              <p className="mb-3 text-center text-xs text-ink/65">
                Prefer to speak with the team or use existing online scheduling?
              </p>
              <a
                href="tel:+12485696304"
                onClick={onCall}
                className="button-primary min-h-12 w-full"
              >
                <Phone className="h-4 w-4" aria-hidden="true" /> (248) 569-6304
              </a>
              <a
                href="https://truelark.com/bookonline/#/location?businessId=85431"
                target="_blank"
                rel="noreferrer"
                onClick={onSchedulerOpen}
                className="button-secondary mt-3 min-h-11 w-full !text-[10px]"
              >
                Use online scheduling{" "}
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PopupContext.Provider>
  );
}
