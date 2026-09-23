"use client";

import React from "react";

export type AgentArchetype = "ember" | "specter";
export type SpriteState = "idle" | "thinking" | "celebrating" | "alert";

interface PixelSpriteProps {
  archetype?: AgentArchetype;
  state?: SpriteState;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showGlow?: boolean;
}

const SIZE_MAP = {
  xs: "w-5 h-5",
  sm: "w-7 h-7",
  md: "w-9 h-9",
  lg: "w-14 h-14",
  xl: "w-20 h-20",
};

/**
 * Flame Spirit ("Ember")
 * A pixel-art fire familiar spirit with a radiant molten core and dancing embers.
 */
function EmberSprite({ state }: { state: SpriteState }) {
  const isThinking = state === "thinking";
  const isCelebrating = state === "celebrating";
  const isAlert = state === "alert";

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
    >
      <defs>
        <filter id="ember-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation={isThinking ? 2.5 : 1.2}
            floodColor={isAlert ? "#ef4444" : isCelebrating ? "#10b981" : "#f59e0b"}
            floodOpacity="0.8"
          />
        </filter>
      </defs>

      {/* Outer Glow / Halo Filter */}
      <g filter="url(#ember-glow)">
        {/* Flame Base Silhouette (Dark Amber / Crimson) */}
        <rect x="8" y="18" width="8" height="3" fill={isAlert ? "#7f1d1d" : "#7c2d12"} />
        <rect x="7" y="15" width="10" height="3" fill={isAlert ? "#991b1b" : "#9a3412"} />
        <rect x="6" y="11" width="12" height="4" fill={isAlert ? "#b91c1c" : "#c2410c"} />
        <rect x="7" y="7" width="10" height="4" fill={isAlert ? "#dc2626" : "#ea580c"} />

        {/* Flame Tips / Horns */}
        <rect x="8" y="4" width="4" height="3" fill={isAlert ? "#ef4444" : "#f97316"} />
        <rect x="13" y="5" width="3" height="3" fill={isAlert ? "#ef4444" : "#f97316"} />
        <rect x="9" y="2" width="2" height="2" fill={isAlert ? "#f87171" : "#fb923c"} />

        {/* Mid Layer Flame (Vibrant Gold / Orange) */}
        <rect x="8" y="13" width="8" height="4" fill={isAlert ? "#f87171" : "#f59e0b"} />
        <rect x="9" y="9" width="6" height="4" fill={isAlert ? "#fca5a5" : "#fbbf24"} />

        {/* Radiant Heart Nucleus (Pure White / Bright Sun) */}
        <rect x="10" y="12" width="4" height="4" fill="#ffffff" />
        <rect x="11" y="10" width="2" height="2" fill="#ffffff" />

        {/* Eyes (Dark Pixel Slits) */}
        <rect x="9" y="12" width="1" height="2" fill={isAlert ? "#450a0a" : "#431407"} />
        <rect x="14" y="12" width="1" height="2" fill={isAlert ? "#450a0a" : "#431407"} />

        {/* Orbiting / Floating Sparks */}
        <rect
          x="4"
          y={isThinking ? "6" : "9"}
          width="2"
          height="2"
          fill={isCelebrating ? "#34d399" : "#fbbf24"}
          className={isThinking ? "animate-spin origin-center" : ""}
        />
        <rect
          x="18"
          y={isThinking ? "14" : "11"}
          width="2"
          height="2"
          fill={isCelebrating ? "#6ee7b7" : "#f97316"}
        />
        <rect x="15" y="2" width="2" height="2" fill="#fde047" />

        {/* Celebration Sparks */}
        {isCelebrating && (
          <>
            <rect x="3" y="3" width="2" height="2" fill="#34d399" />
            <rect x="19" y="3" width="2" height="2" fill="#34d399" />
            <rect x="11" y="0" width="2" height="2" fill="#6ee7b7" />
          </>
        )}

        {/* Alert Exclamation Spark */}
        {isAlert && (
          <>
            <rect x="11" y="0" width="2" height="1" fill="#ef4444" />
            <rect x="11" y="2" width="2" height="1" fill="#ef4444" />
          </>
        )}
      </g>
    </svg>
  );
}

/**
 * Network Ghost ("Specter")
 * An ethereal cyan cyber-wisp composed of data nodes and floating digital aura.
 */
function SpecterSprite({ state }: { state: SpriteState }) {
  const isThinking = state === "thinking";
  const isCelebrating = state === "celebrating";
  const isAlert = state === "alert";

  const primary = isAlert ? "#ef4444" : isCelebrating ? "#10b981" : "#06b6d4";
  const secondary = isAlert ? "#b91c1c" : isCelebrating ? "#059669" : "#0891b2";
  const core = isAlert ? "#fca5a5" : "#a5f3fc";

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ imageRendering: "pixelated", shapeRendering: "crispEdges" }}
    >
      <defs>
        <filter id="specter-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation={isThinking ? 2.5 : 1.2}
            floodColor={primary}
            floodOpacity="0.8"
          />
        </filter>
      </defs>

      <g filter="url(#specter-glow)">
        {/* Ghost Crown / Head */}
        <rect x="8" y="4" width="8" height="3" fill={primary} />
        <rect x="6" y="7" width="12" height="7" fill={primary} />

        {/* Digital Floating Ribs / Body */}
        <rect x="7" y="14" width="10" height="4" fill={secondary} />
        <rect x="8" y="18" width="3" height="3" fill={secondary} />
        <rect x="13" y="18" width="3" height="3" fill={secondary} />
        <rect x="10" y="20" width="4" height="2" fill={primary} />

        {/* Glowing Data Eyes */}
        <rect x="8" y="9" width="3" height="3" fill={core} />
        <rect x="13" y="9" width="3" height="3" fill={core} />
        <rect x="9" y="10" width="1" height="1" fill="#ffffff" />
        <rect x="14" y="10" width="1" height="1" fill="#ffffff" />

        {/* Orbiting Satellite Data Bits */}
        <rect x="4" y={isThinking ? "4" : "12"} width="2" height="2" fill={core} />
        <rect x="18" y={isThinking ? "18" : "8"} width="2" height="2" fill={core} />
        <rect x="11" y="1" width="2" height="2" fill={core} />
      </g>
    </svg>
  );
}

export function PixelSprite({
  archetype = "ember",
  state = "idle",
  size = "md",
  className = "",
  showGlow = true,
}: PixelSpriteProps) {
  // CSS animation state classes
  const getStateClass = () => {
    switch (state) {
      case "thinking":
        return "animate-pulse scale-105 duration-700";
      case "celebrating":
        return "animate-bounce duration-500";
      case "alert":
        return "animate-ping duration-1000";
      case "idle":
      default:
        return "transition-transform hover:scale-110 motion-safe:animate-[bounce_3s_ease-in-out_infinite]";
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${
        SIZE_MAP[size]
      } ${getStateClass()} ${className}`}
      title={`${archetype === "ember" ? "Ignis (Secretary)" : "Specter (Auditor)"} - Status: ${state}`}
    >
      {/* Background Soft Glow Aura */}
      {showGlow && (
        <span
          className={`absolute inset-0 rounded-full blur-md opacity-40 ${
            state === "alert"
              ? "bg-rose-500"
              : state === "celebrating"
              ? "bg-emerald-400"
              : archetype === "ember"
              ? "bg-amber-500"
              : "bg-cyan-400"
          }`}
        />
      )}

      {/* Render Chosen Sprite */}
      <div className="relative z-10 w-full h-full drop-shadow-md">
        {archetype === "ember" ? (
          <EmberSprite state={state} />
        ) : (
          <SpecterSprite state={state} />
        )}
      </div>
    </div>
  );
}
