import { useState, useEffect } from "react";
import { getVersion } from "@tauri-apps/api/app";
import type { City } from "../lib/cities";
import { ALL_CITIES } from "../lib/cities";

interface SettingsProps {
  cities: City[];
  baseIndex: number;
  use24Hour: boolean;
  onToggle24Hour: () => void;
  onAddCity: (city: City) => void;
  onRemoveCity: (timezone: string) => void;
  onSetBase: (index: number) => void;
  onClose: () => void;
}

export function Settings({ cities, baseIndex, use24Hour, onToggle24Hour, onAddCity, onRemoveCity, onSetBase, onClose }: SettingsProps) {
  const [search, setSearch] = useState("");
  const [appVersion, setAppVersion] = useState("");
  useEffect(() => { getVersion().then(setAppVersion).catch(() => {}); }, []);

  const availableCities = ALL_CITIES.filter(
    (c) => !cities.some((existing) => existing.timezone === c.timezone)
  ).filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      position: "absolute",
      inset: 0,
      background: "#0c0c14",
      zIndex: 100,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 20px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <h2 style={{
          margin: 0,
          fontSize: "18px",
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontWeight: 400,
          fontStyle: "italic",
        }}>
          설정
        </h2>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#e8e8f0",
            padding: "6px 14px",
            borderRadius: "100px",
            fontFamily: "'DM Mono', monospace",
            fontSize: "11px",
            cursor: "pointer",
          }}
        >
          ✕ 닫기
        </button>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "16px 20px" }}>
        {/* Time Format Toggle */}
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "9px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          opacity: 0.4,
          marginBottom: "10px",
        }}>
          시간 표시
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 12px",
            borderRadius: "10px",
            marginBottom: "16px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <span style={{ fontSize: "13px", fontFamily: "'DM Mono', monospace" }}>
            {use24Hour ? "24시간 (14:30)" : "12시간 (2:30 PM)"}
          </span>
          <button
            onClick={onToggle24Hour}
            style={{
              background: use24Hour ? "rgba(108,99,255,0.25)" : "rgba(255,255,255,0.08)",
              border: use24Hour ? "1px solid rgba(108,99,255,0.4)" : "1px solid rgba(255,255,255,0.12)",
              color: use24Hour ? "#a5a0ff" : "rgba(255,255,255,0.5)",
              padding: "4px 10px",
              borderRadius: "100px",
              fontFamily: "'DM Mono', monospace",
              fontSize: "10px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            {use24Hour ? "24H" : "12H"}
          </button>
        </div>

        {/* Current Cities */}
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "9px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          opacity: 0.4,
          marginBottom: "10px",
        }}>
          등록된 도시 ({cities.length})
        </div>

        {cities.map((city, idx) => (
          <div
            key={city.timezone}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderRadius: "10px",
              marginBottom: "6px",
              background: idx === baseIndex ? "rgba(108,99,255,0.12)" : "rgba(255,255,255,0.03)",
              border: idx === baseIndex ? "1px solid rgba(108,99,255,0.3)" : "1px solid transparent",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "18px" }}>{city.flag}</span>
              <div>
                <div style={{ fontSize: "14px", fontFamily: "'Instrument Serif', Georgia, serif" }}>
                  {city.name}
                </div>
                <div style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace", opacity: 0.5 }}>
                  {city.label}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {idx === baseIndex ? (
                <span style={{
                  fontSize: "9px",
                  fontFamily: "'DM Mono', monospace",
                  color: "#6c63ff",
                  padding: "2px 8px",
                  borderRadius: "100px",
                  background: "rgba(108,99,255,0.15)",
                  fontWeight: 600,
                }}>
                  기준
                </span>
              ) : (
                <button
                  onClick={() => onSetBase(idx)}
                  style={{
                    background: "none",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.5)",
                    padding: "3px 8px",
                    borderRadius: "100px",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "9px",
                    cursor: "pointer",
                  }}
                >
                  기준 설정
                </button>
              )}
              <button
                onClick={() => onRemoveCity(city.timezone)}
                style={{
                  background: "none",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.3)",
                  padding: "3px 8px",
                  borderRadius: "100px",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "9px",
                  cursor: "pointer",
                }}
              >
                삭제
              </button>
            </div>
          </div>
        ))}

        {/* Add Cities */}
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "9px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          opacity: 0.4,
          marginTop: "20px",
          marginBottom: "10px",
        }}>
          도시 추가
        </div>

        <input
          type="text"
          placeholder="도시 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            color: "#e8e8f0",
            fontFamily: "'DM Mono', monospace",
            fontSize: "12px",
            outline: "none",
            marginBottom: "10px",
            boxSizing: "border-box",
          }}
        />

        {availableCities.map((city) => (
          <div
            key={city.timezone}
            onClick={() => onAddCity(city)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              borderRadius: "10px",
              marginBottom: "4px",
              background: "rgba(255,255,255,0.02)",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "18px" }}>{city.flag}</span>
              <div>
                <div style={{ fontSize: "14px", fontFamily: "'Instrument Serif', Georgia, serif" }}>
                  {city.name}
                </div>
                <div style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace", opacity: 0.5 }}>
                  {city.label}
                </div>
              </div>
            </div>
            <span style={{
              fontSize: "16px",
              opacity: 0.3,
            }}>+</span>
          </div>
        ))}

        {/* App Version */}
        <div style={{
          marginTop: "28px",
          paddingTop: "16px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          textAlign: "center",
          fontFamily: "'DM Mono', monospace",
          fontSize: "10px",
          opacity: 0.3,
          letterSpacing: "0.05em",
        }}>
          World Clock {appVersion ? `v${appVersion}` : ""}
        </div>
      </div>
    </div>
  );
}
