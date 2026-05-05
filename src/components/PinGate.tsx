import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import dvskLogo from "../assets/Secondary_logo.svg";

const PIN_VALUE = "8401";
const PIN_LENGTH = PIN_VALUE.length;
const SESSION_KEY = "dvsk_pin_unlocked";

interface PinGateProps {
  children: ReactNode;
}

/**
 * Forces the user to enter the launch PIN before any of the rest of the app
 * (login screen, dashboard, etc.) is shown. Unlock state lives in
 * sessionStorage, so it lasts as long as the app window is open and is wiped
 * the moment the user fully quits the app — exactly the "ask every time you
 * open it" behavior.
 */
export default function PinGate({ children }: PinGateProps) {
  const [unlocked, setUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [digits, setDigits] = useState<string[]>(() => Array(PIN_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!unlocked) {
      // Focus first input as soon as the gate mounts
      setTimeout(() => inputsRef.current[0]?.focus(), 80);
    }
  }, [unlocked]);

  const submit = (current: string[]) => {
    const entered = current.join("");
    if (entered.length !== PIN_LENGTH) return;
    if (entered === PIN_VALUE) {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {}
      setUnlocked(true);
    } else {
      setError("Wrong PIN");
      setShake(true);
      setTimeout(() => {
        setDigits(Array(PIN_LENGTH).fill(""));
        setShake(false);
        inputsRef.current[0]?.focus();
      }, 450);
      setTimeout(() => setError(null), 2200);
    }
  };

  const handleChange = (index: number, raw: string) => {
    // Only digits, 1 char per box
    const v = raw.replace(/\D/g, "").slice(0, 1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = v;
      // If user pasted a 4-digit string into one box, distribute it
      if (raw.length > 1) {
        const cleaned = raw.replace(/\D/g, "").slice(0, PIN_LENGTH);
        for (let i = 0; i < PIN_LENGTH; i++) next[i] = cleaned[i] ?? "";
      }
      // Auto-advance focus after a digit is typed
      if (v && index < PIN_LENGTH - 1) {
        setTimeout(() => inputsRef.current[index + 1]?.focus(), 0);
      }
      // Auto-submit when last digit is filled
      if (next.every((d) => d !== "")) {
        setTimeout(() => submit(next), 80);
      }
      return next;
    });
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      // Backspace on an empty box jumps to previous box and clears it
      const next = [...digits];
      next[index - 1] = "";
      setDigits(next);
      inputsRef.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowRight" && index < PIN_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
      e.preventDefault();
    } else if (e.key === "Enter") {
      submit(digits);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0914] text-[#ececec] relative overflow-hidden">
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[60%] h-[60%] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm px-6"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-white/10 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.6)] mb-4">
            <img src={dvskLogo} alt="DVSK" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-[24px] font-bold tracking-tight text-white">DVSK Admin</h1>
          <p className="text-[11px] tracking-[0.3em] text-[#666] uppercase mt-1">
            Enter PIN to continue
          </p>
        </div>

        {/* PIN inputs */}
        <motion.div
          animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
          className="flex items-center justify-center gap-3"
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="password"
              inputMode="numeric"
              autoComplete="off"
              maxLength={PIN_LENGTH}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-14 h-16 text-center text-[24px] font-bold rounded-xl bg-[#0a0a0a] border outline-none transition-all
                ${
                  error
                    ? "border-red-500/50 ring-2 ring-red-500/20 text-red-400"
                    : d
                    ? "border-purple-500/50 ring-2 ring-purple-500/10 text-white"
                    : "border-white/10 hover:border-white/20 text-white"
                }`}
              aria-label={`PIN digit ${i + 1}`}
            />
          ))}
        </motion.div>

        {/* Error message */}
        <div className="h-6 mt-4 flex items-center justify-center">
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[12px] text-red-400 tracking-[0.15em] uppercase font-semibold"
            >
              {error}
            </motion.p>
          )}
        </div>

        <p className="text-center text-[10px] tracking-[0.25em] text-[#444] uppercase mt-6">
          DVSK CLO. — Internal Tool
        </p>
      </motion.div>
    </div>
  );
}
