import React, { useState, useEffect, useRef } from "react";
import {
  Flame,
  Bug,
  Globe,
  KeyRound,
  ShieldOff,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { simulateRisk } from "../../api/policyApi";




export default function AttackSimulator({ refresh }) {
  const [payloadDetails, setPayloadDetails] = useState(null);
  const audioRef = useRef(null);

  const playSound = (file) => {
    // Stop previous sound if exists
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Create and play new sound
    const audio = new Audio(file);
    audio.volume = 1.0;
    audio.play().catch(() => { });

    audioRef.current = audio;
  };

  const token = localStorage.getItem("token");
  const email = token ? JSON.parse(atob(token.split(".")[1])).email : "unknown@user";
  const resultRef = useRef(null);


  const [loading, setLoading] = useState(false);
  const [scenarios, setScenarios] = useState({});
  const [mode, setMode] = useState("quick");
  const [result, setResult] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  // ✨ Sleep helper for staggered animations
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  useEffect(() => {
    if (result && resultRef.current) {
      setTimeout(() => {
        const elementTop = resultRef.current.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementTop - 300, // 👈 adjust: 50, 100, 150, 200... up to you
          behavior: "smooth",
        });
      }, 200);
    }
  }, [result]);



  /* ----------------------------------------------------------
     Fetch backend scenarios
  ---------------------------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:5002/api/policy/test-scenarios");
        const json = await res.json();
        setScenarios(json.scenarios || {});
      } catch (err) {
        console.log(err);
      }
    })();
  }, []);

  const pushTimeline = (msg, type = "info") =>
    setTimeline((prev) => [...prev, { msg, type }]);

  /* ----------------------------------------------------------
     Attack Execution
  ---------------------------------------------------------- */
  const runAttack = async (payload) => {
    setLoading(true);
    setResult(null);
    setTimeline([]);
    setCurrentStep(0);

    // STEP 0 → Build Payload
    pushTimeline("🧱 Building payload with user & scenario…", "info");
    setCurrentStep(0);
    await wait(700);
    playSound("/sounds/rightanswer-95219.mp3");

    // STEP 1 → Prepare and send request
    pushTimeline("📤 Payload prepared. Queuing attack packets…", "info");
    setCurrentStep(1);
    playSound("/sounds/rightanswer-95219.mp3");
    await wait(800);

    try {
      // STEP 2 → Policy Engine evaluates
      pushTimeline("🚀 Dispatching to Policy Engine…", "info");
      await wait(400);
      const finalPayload = { user: { email }, ...payload };
setPayloadDetails(finalPayload);

      const response = await simulateRisk({
        user: { email },
        ...payload,
      });
      console.log("response", response)

      setCurrentStep(2);
      pushTimeline("🧠 Policy Engine correlating signals…", "info");
      playSound("/sounds/rightanswer-95219.mp3");
      await wait(900);

      pushTimeline("📊 Scoring and decision computed.", "success");

      // STEP 3 → Final decision
      setCurrentStep(3);
      playSound("/sounds/rightanswer-95219.mp3");
      await wait(500);

      pushTimeline(`🎯 Final decision: ${response.decision}`, "success");
      // 🔊 Play horror sound only when DENY
      if (response.decision === "DENY") {
        playSound("/sounds/holiday_movie_bgm.mp3");
      }


      setResult(response);
      refresh?.();
    } catch (err) {
      console.error(err);
      setCurrentStep(3);
      pushTimeline("❌ Engine error: Request failed!", "error");
    }

    setLoading(false);
  };

  /* ----------------------------------------------------------
     Scenario Lists
  ---------------------------------------------------------- */
  const QUICK = [
    {
      name: "Pyongyang Login",
      icon: Globe,
      payload: { location: { country: "KP", city: "Pyongyang" } },
    },
    {
      name: "Rooted Device",
      icon: ShieldOff,
      payload: { device: { rooted: true } },
    },
    {
      name: "Malicious IP (85)",
      icon: Bug,
      payload: {
        test_risk_score: 85,
        test_risk_factors: ["Malicious IP Reputation"],
      },
    },
    {
      name: "MFA Bypass",
      icon: KeyRound,
      payload: { context: { mfa_verified: false } },
    },
  ];

  const EXTREME = [
    {
      name: "Critical Attack (92)",
      icon: Flame,
      payload: {
        test_risk_score: 92,
        device: { rooted: true },
        context: { mfa_verified: false },
      },
    },
    {
      name: "Threat Level (98)",
      icon: Flame,
      payload: {
        test_risk_score: 98,
        location: { isp: "TOR Exit Node" },
      },
    },
    {
      name: "Full Compromise (100)",
      icon: Flame,
      payload: {
        test_risk_score: 100,
        device: { rooted: true, jailbroken: true },
      },
    },
  ];

  /* ----------------------------------------------------------
     Neon Skull Loader
  ---------------------------------------------------------- */
  const NeonSkullLoader = () => (
    <div className="flex flex-col items-center gap-4 mt-8">
      {/* Skull Container */}
      <div className="relative">
        {/* Outer glow ring */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-orange-500/20 via-amber-400/10 to-rose-500/20 blur-xl animate-pulse" />
        {/* Inner ring */}
        <div className="absolute inset-1 rounded-full border border-orange-400/40 animate-spin" />
        {/* Core ring */}
        <div className="absolute inset-3 rounded-full border border-amber-300/50 border-dashed animate-[spin_4s_linear_infinite]" />

        {/* Neon Skull Face */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-14 h-16 rounded-[40%] bg-slate-950 border border-orange-400/70 shadow-[0_0_25px_rgba(249,115,22,0.7)]">
            {/* Eyes */}
            <div className="absolute inset-x-2 top-3 flex justify-between">
              <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)] animate-ping" />
              <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.9)] animate-ping delay-150" />
            </div>
            {/* Nose */}
            <div className="absolute top-7 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-orange-400/80 shadow-[0_0_10px_rgba(249,115,22,0.9)]" />
            {/* Jaw */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-4 rounded-b-[12px] border-t border-orange-300/70 flex justify-center gap-1">
              <span className="w-1 h-3 bg-orange-300/80 rounded-sm" />
              <span className="w-1 h-3 bg-orange-300/60 rounded-sm" />
              <span className="w-1 h-3 bg-orange-300/80 rounded-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-1 text-xs text-orange-200">
        <p className="font-semibold tracking-wide uppercase">
          Engaging Neon Skull Engine…
        </p>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" />
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce delay-150" />
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce delay-300" />
        </div>
      </div>
    </div>
  );

  /* ----------------------------------------------------------
     Scenario Cards
  ---------------------------------------------------------- */
  const renderButtons = (items) => (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {items.map((item, i) => (
        <button
          key={i}
          disabled={loading}
          onClick={() => runAttack(item.payload)}
          className={`
            relative overflow-hidden group
            p-4 rounded-xl transition-all shadow-md border
            bg-slate-950/80 backdrop-blur-xl
            border-orange-500/40
            hover:shadow-[0_10px_35px_rgba(249,115,22,0.55)]
            hover:-translate-y-[3px]
            ${loading ? "opacity-40 cursor-not-allowed" : ""}
          `}
        >
          {/* Glow */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="absolute w-full h-full rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-400/20 blur-xl" />
          </div>

          <item.icon className="text-orange-400 mb-2 relative z-10" size={22} />
          <p className="text-[13px] font-semibold text-slate-50 relative z-10">
            {item.name}
          </p>
          <p className="text-[10px] text-slate-400 mt-1 relative z-10">
            Tap to launch this scenario
          </p>
        </button>
      ))}
    </div>
  );

  /* ----------------------------------------------------------
     Step Flow (Pipeline Grid)
  ---------------------------------------------------------- */
  const STEPS = [
    { label: "Build Payload", desc: "Merge user + scenario" },
    { label: "Send Request", desc: "POST → Engine" },
    { label: "Risk Evaluation", desc: "Signals + Rules" },
    { label: "Decision", desc: "ALLOW / DENY / MFA" },
  ];

  const StepFlow = () => (
    <div className="mt-6">
      <p className="text-[11px] font-semibold text-orange-300 mb-2 flex items-center gap-2">
        <ShieldOff size={13} className="text-orange-400" />
        Attack Pipeline
      </p>

      <div className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-2 items-center">
        {STEPS.map((step, index) => {
          const isDone = index < currentStep;
          const isActive = index === currentStep && loading;
          const isFuture = index > currentStep;

          let bg =
            "bg-slate-900/80 border border-slate-700 text-slate-300 shadow-inner transition-all duration-300";

          if (isDone)
            bg =
              "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg border-none scale-[1.02]";

          if (isActive)
            bg =
              "bg-slate-950 border border-orange-400 text-orange-200 shadow-[0_0_20px_rgba(249,115,22,0.7)] animate-pulse";

          return (
            <React.Fragment key={step.label}>
              <div className={`col-span-2 rounded-xl px-3 py-2 flex flex-col gap-1 ${bg}`}>
                <div className="flex items-center gap-1 text-[11px] font-semibold">
                  {isDone && <CheckCircle2 size={13} className="text-white" />}
                  {isActive && (
                    <Loader2 size={13} className="animate-spin text-amber-200" />
                  )}
                  {isFuture && (
                    <ChevronRight size={13} className="text-slate-400" />
                  )}
                  <span>{step.label}</span>
                </div>
                <p className="text-[10px] opacity-80">{step.desc}</p>
              </div>

              {index < STEPS.length - 1 && (
                <div className="col-span-1 flex justify-center">
                  <ChevronRight
                    size={20}
                    className={`transition-all ${index < currentStep ? "text-orange-400" : "text-slate-600"
                      }`}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  /* ----------------------------------------------------------
     Attack Timeline
  ---------------------------------------------------------- */
  const AttackTimeline = () => (
    <div className="mt-5 p-4 rounded-xl border border-slate-800 bg-slate-950/80">
      <p className="text-xs font-bold text-orange-300 mb-2">Attack Timeline</p>

      <ul className="space-y-1 max-h-32 overflow-y-auto pr-1">
        {timeline.map((t, i) => (
          <li key={i} className="flex items-center text-[11px] text-slate-100">
            {t.type === "success" && (
              <CheckCircle2 size={12} className="text-emerald-400 mr-1" />
            )}
            {t.type === "error" && (
              <XCircle size={12} className="text-red-400 mr-1" />
            )}
            {t.type === "info" && (
              <ChevronRight size={12} className="text-slate-400 mr-1" />
            )}
            {t.msg}
          </li>
        ))}
      </ul>
    </div>
  );

  /* ----------------------------------------------------------
     Neon Skull Badge for Result
  ---------------------------------------------------------- */
  const NeonSkullBadge = ({ score = 0, decision }) => {
    const isCritical = score >= 90;
    const isHigh = score >= 60 && score < 90;

    const eyeColor =
      score >= 90
        ? "bg-red-500 shadow-[0_0_16px_rgba(248,113,113,0.9)]"
        : score >= 60
          ? "bg-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.9)]"
          : "bg-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.9)]";

    return (
      <div className="flex flex-col items-center gap-3 mt-4">
        <div className="relative">
          {/* Outer glow */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/25 via-amber-400/10 to-red-500/25 blur-xl" />

          {/* Core skull */}
          <div className="absolute inset-1 flex items-center justify-center">
            <div className="relative w-16 h-18 rounded-[40%] bg-slate-950 border border-orange-400/80 shadow-[0_0_30px_rgba(249,115,22,0.8)]">
              {/* Eyes */}
              <div className="absolute inset-x-3 top-3 flex justify-between">
                <div
                  className={`w-3 h-3 rounded-full ${eyeColor} animate-pulse`}
                />
                <div
                  className={`w-3 h-3 rounded-full ${eyeColor} animate-pulse delay-150`}
                />
              </div>
              {/* Nose */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-orange-300 shadow-[0_0_10px_rgba(253,186,116,0.9)]" />
              {/* Jaw */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-11 h-4 rounded-b-[12px] border-t border-orange-300/70 flex justify-center gap-1">
                <span className="w-1 h-3 bg-orange-200/80 rounded-sm" />
                <span className="w-1 h-3 bg-orange-200/60 rounded-sm" />
                <span className="w-1 h-3 bg-orange-200/80 rounded-sm" />
              </div>
            </div>
          </div>
        </div>

        <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-orange-200">
          {decision === "DENY"
            ? "NEON SKULL SAYS: BLOCK"
            : decision === "MFA_REQUIRED"
              ? "NEON SKULL SAYS: CHALLENGE"
              : "NEON SKULL SAYS: ALLOW"}
        </p>

        <div
          className={`px-3 py-1 rounded-full text-[11px] font-bold border
          ${isCritical
              ? "bg-red-600/30 text-red-200 border-red-500/50"
              : isHigh
                ? "bg-amber-500/20 text-amber-200 border-amber-400/60"
                : "bg-emerald-500/20 text-emerald-200 border-emerald-400/60"
            }`}
        >
          {isCritical ? "CRITICAL THREAT" : isHigh ? "HIGH RISK" : "LOW RISK"}
        </div>
      </div>
    );
  };

  /* ----------------------------------------------------------
     Result Panel
  ---------------------------------------------------------- */
  const ResultPanel = () =>
    result && (
      <div ref={resultRef}
        className="mt-8 p-6 rounded-2xl shadow-xl border border-orange-400/20 
      bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900/90 
      backdrop-blur-xl animate-[fadeIn_0.4s_ease-out]"
      >
        {/* Title */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-50 text-sm flex items-center gap-2">
            <Flame className="text-orange-400" size={16} />
            Final Analysis Report
          </h3>
          <span className="text-[10px] px-2 py-1 rounded-full bg-slate-900/80 text-slate-300 border border-slate-700">
            Engine: Orange Pipeline
          </span>
        </div>

        {/* Decision */}
        <p
          className={`text-3xl font-extrabold tracking-wide text-center mb-1
          animate-[popIn_0.4s_ease-out]
          ${result.decision === "DENY"
              ? "text-red-500 drop-shadow-[0_0_6px_rgba(248,113,113,0.9)]"
              : result.decision === "MFA_REQUIRED"
                ? "text-amber-300 drop-shadow-[0_0_6px_rgba(252,211,77,0.9)]"
                : "text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.9)]"
            }`}
        >
          {result.decision}
        </p>
        <p className="text-[11px] text-center text-slate-400 mb-2">
          {email} · risk-correlated access decision
        </p>

        {/* Neon Skull + Risk */}
        <NeonSkullBadge
          score={result.risk_score}
          decision={result.decision}
        />

        {/* Risk Score Bar */}
        <div className="mt-5">
          <p className="text-[11px] font-medium text-slate-100">
            Risk Score & Confidence
          </p>
          <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden mt-1 border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 rounded-full"
              style={{ width: `${Math.min(result.risk_score, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[11px] text-slate-400">
            <span>{result.risk_score} / 100</span>
            <span>confidence: {result.confidence ?? "high"}</span>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="mt-6">
          <p className="text-xs font-bold text-slate-100 mb-2">
            Risk Indicators
          </p>
          {result.risk_factors?.length ? (
            <div className="flex flex-wrap gap-2">
              {result.risk_factors.map((f, i) => (
                <span
                  key={i}
                  className="text-[10px] px-2 py-1 rounded-md bg-slate-900 border border-orange-500/30 
                  text-orange-300 shadow-[0_0_8px_rgba(249,115,22,0.35)]"
                >
                  {f}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500">
              No explicit risk factors returned by engine.
            </p>
          )}
        </div>
      </div>
    );

  /* ----------------------------------------------------------
     MAIN UI
  ---------------------------------------------------------- */
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden">
      {/* subtle background grid / glow */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-24 -right-10 w-60 h-60 bg-gradient-to-br from-orange-500/10 via-amber-400/5 to-red-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 w-60 h-60 bg-gradient-to-tr from-slate-500/10 via-slate-700/10 to-orange-500/5 blur-3xl" />
      </div>

      <div className="relative z-10">
        <h2 className="font-extrabold text-slate-50 flex items-center gap-2 text-sm">
          <Flame className="text-orange-400" size={18} />
          Attack Simulator · Neon Skull Engine
        </h2>
        <p className="text-[11px] text-slate-400 mt-1">
          Launch synthetic adversarial scenarios & watch the policy engine react in
          real-time.
        </p>

        {/* Mode Selector */}
        <div className="flex gap-2 mt-4">
          {["quick", "extreme", "backend"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${mode === m
                  ? "bg-gradient-to-r from-orange-500 to-amber-400 text-slate-950 border-orange-400 shadow-lg"
                  : "bg-slate-950/90 text-slate-200 border-slate-700 hover:border-orange-400 hover:text-orange-200"
                }`}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Scenario Cards */}
        {mode === "quick" && renderButtons(QUICK)}
        {mode === "extreme" && renderButtons(EXTREME)}
        {mode === "backend" &&
          renderButtons(
            Object.values(scenarios).map((sc) => ({
              name: sc.name,
              payload: sc,
              icon: Flame,
            }))
          )}

        {/* Loader */}
        {loading && <NeonSkullLoader />}

        {/* Flow + Timeline + Result */}
        <StepFlow />
        <AttackTimeline />
        <ResultPanel />
      </div>
    </div>
  );
}
