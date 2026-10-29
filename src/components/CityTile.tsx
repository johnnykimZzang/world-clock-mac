import type { City } from "../lib/cities";
import {
  WORK_LABEL,
  formatHourDiff,
  formatTime12,
  formatTime24,
  getDayLabel,
  getHourOffset,
  localParts,
  relativeDay,
  relativeDayLabel,
  timezoneAbbr,
  workStatus,
} from "../lib/time";
import { skyFor } from "../lib/sun";
import { SkyOrb } from "./SkyOrb";

interface CityTileProps {
  city: City;
  effectiveDate: Date;
  baseTimezone: string;
  use24Hour: boolean;
  index: number;
  onClick: () => void;
}

export function CityTile({ city, effectiveDate, baseTimezone, use24Hour, index, onClick }: CityTileProps) {
  const { hour, minute } = localParts(city.timezone, effectiveDate);
  const sky = skyFor(city.timezone, effectiveDate);
  const diff = getHourOffset(baseTimezone, city.timezone, effectiveDate);
  const day = relativeDay(baseTimezone, city.timezone, effectiveDate);
  const status = workStatus(city.timezone, effectiveDate);
  const abbr = timezoneAbbr(city.timezone, effectiveDate, city.label);
  const t12 = formatTime12(hour, minute);

  return (
    <button
      className="glass tile"
      onClick={onClick}
      style={{ animationDelay: `${index * 40}ms` }}
      title={`${city.name}을(를) 기준으로 설정`}
    >
      <SkyOrb sky={sky} glow={92} disc={9} />

      <div className="tile-top">
        <div style={{ minWidth: 0 }}>
          <div className="flag">{city.flag}</div>
          <div className="tile-city">{city.name}</div>
        </div>
        <span className="chip tnum">{formatHourDiff(diff)}</span>
      </div>

      <div>
        <div className="tile-time tnum">
          {use24Hour ? formatTime24(hour, minute) : t12.display}
          {!use24Hour && <span className="period">{t12.period}</span>}
        </div>
        <div className="tile-foot">
          <span className={`status ${status}`}>
            <i className={`dot ${status}`} />
            {WORK_LABEL[status]}
          </span>
          <span className="tile-day">
            {day !== 0 ? <b>{relativeDayLabel(day)}</b> : getDayLabel(sky.state)} · {abbr}
          </span>
        </div>
      </div>
    </button>
  );
}
