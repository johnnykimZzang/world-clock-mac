import { useState, useEffect } from "react";
import { getVersion } from "@tauri-apps/api/app";
import type { City } from "../lib/cities";
import { ALL_CITIES } from "../lib/cities";
import { timezoneAbbr } from "../lib/time";
import { useAutostart } from "../hooks/useAutostart";

function Switch({ on, disabled, onChange }: { on: boolean; disabled?: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onChange}
      style={{
        width: "38px",
        height: "22px",
        borderRadius: "100px",
        border: "none",
        padding: "2px",
        background: on ? "var(--accent)" : "var(--edge)",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span style={{
        display: "block",
        width: "18px",
        height: "18px",
        borderRadius: "50%",
        background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.35)",
        transform: on ? "translateX(16px)" : "translateX(0)",
        transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
      }} />
    </button>
  );
}

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
  const autostart = useAutostart();
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
      background: "var(--sheet)",
      backdropFilter: "blur(24px) saturate(160%)",
      WebkitBackdropFilter: "blur(24px) saturate(160%)",
      zIndex: 100,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "20px 20px 12px",
        borderBottom: "1px solid var(--sep)",
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
            background: "var(--fill-2)",
            border: "1px solid var(--edge)",
            color: "var(--fg)",
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
        {/* General */}
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "9px",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          opacity: 0.4,
          marginBottom: "10px",
        }}>
          일반
        </div>
        <div style={{
          borderRadius: "10px",
          marginBottom: "20px",
          background: "var(--fill-2)",
          border: "1px solid var(--sep)",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            padding: "10px 12px",
            borderBottom: "1px solid var(--sep)",
          }}>
            <div>
              <div style={{ fontSize: "13px", fontFamily: "'DM Mono', monospace" }}>24시간 표시</div>
              <div style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace", opacity: 0.45, marginTop: "2px" }}>
                {use24Hour ? "14:30" : "2:30 PM"}
              </div>
            </div>
            <Switch on={use24Hour} onChange={onToggle24Hour} />
          </div>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            padding: "10px 12px",
          }}>
            <div>
              <div style={{ fontSize: "13px", fontFamily: "'DM Mono', monospace" }}>로그인 시 자동 시작</div>
              <div style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace", opacity: 0.45, marginTop: "2px" }}>
                {autostart.available ? "Mac 부팅 후 메뉴바에 바로 표시" : "앱에서만 설정할 수 있습니다"}
              </div>
            </div>
            <Switch
              on={autostart.enabled}
              disabled={!autostart.available || autostart.pending}
              onChange={autostart.toggle}
            />
          </div>
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
              background: idx === baseIndex ? "var(--accent-soft)" : "var(--fill-2)",
              border: idx === baseIndex ? "1px solid var(--accent-edge)" : "1px solid transparent",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "18px" }}>{city.flag}</span>
              <div>
                <div style={{ fontSize: "14px", fontFamily: "'Instrument Serif', Georgia, serif" }}>
                  {city.name}
                </div>
                <div style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace", opacity: 0.5 }}>
                  {timezoneAbbr(city.timezone, new Date(), city.label)}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {idx === baseIndex ? (
                <span style={{
                  fontSize: "9px",
                  fontFamily: "'DM Mono', monospace",
                  color: "var(--accent)",
                  padding: "2px 8px",
                  borderRadius: "100px",
                  background: "var(--accent-soft)",
                  fontWeight: 600,
                }}>
                  기준
                </span>
              ) : (
                <button
                  onClick={() => onSetBase(idx)}
                  style={{
                    background: "none",
                    border: "1px solid var(--edge)",
                    color: "var(--mut)",
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
                  border: "1px solid var(--sep)",
                  color: "var(--dim)",
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
          className="settings-input"
          placeholder="도시 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid var(--edge)",
            background: "var(--fill-2)",
            color: "var(--fg)",
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
              background: "var(--fill-2)",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--fill-2)")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "18px" }}>{city.flag}</span>
              <div>
                <div style={{ fontSize: "14px", fontFamily: "'Instrument Serif', Georgia, serif" }}>
                  {city.name}
                </div>
                <div style={{ fontSize: "10px", fontFamily: "'DM Mono', monospace", opacity: 0.5 }}>
                  {timezoneAbbr(city.timezone, new Date(), city.label)}
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
          borderTop: "1px solid var(--sep)",
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
