import React, { useState, useMemo } from 'react';
import { Bell, X, Clock, Plus } from 'lucide-react';
import {
  formatReminderLabel,
  isoToDatePart,
  isoToTimePart,
  combineDateAndTime,
} from '../utils/datetime';

export interface ReminderPickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
  idPrefix?: string;
}

type PresetKey = 'later-today' | 'tomorrow-morning' | 'tomorrow-evening' | 'next-monday' | 'one-week';

interface Preset {
  key: PresetKey;
  label: string;
  compute: () => string;
}

const presets: Preset[] = [
  {
    key: 'later-today',
    label: 'Later today',
    compute: () => {
      const d = new Date();
      d.setHours(d.getHours() + 3, 0, 0, 0);
      return d.toISOString();
    },
  },
  {
    key: 'tomorrow-morning',
    label: 'Tomorrow morning',
    compute: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(9, 0, 0, 0);
      return d.toISOString();
    },
  },
  {
    key: 'tomorrow-evening',
    label: 'Tomorrow evening',
    compute: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(18, 0, 0, 0);
      return d.toISOString();
    },
  },
  {
    key: 'next-monday',
    label: 'Next Monday',
    compute: () => {
      const d = new Date();
      const daysUntilMon = ((1 - d.getDay() + 7) % 7) || 7;
      d.setDate(d.getDate() + daysUntilMon);
      d.setHours(9, 0, 0, 0);
      return d.toISOString();
    },
  },
  {
    key: 'one-week',
    label: 'One week later',
    compute: () => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      d.setHours(9, 0, 0, 0);
      return d.toISOString();
    },
  },
];

const chipBase: React.CSSProperties = {
  fontSize: '12px',
  padding: '5px 12px',
  borderRadius: '14px',
  cursor: 'pointer',
  transition: 'all 0.15s',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontFamily: 'inherit',
};

const chipActive: React.CSSProperties = {
  background: 'var(--accent)',
  color: 'var(--bg-color)',
  border: '1px solid var(--accent)',
};

const chipIdle: React.CSSProperties = {
  background: 'var(--bg-secondary)',
  color: 'var(--text-muted)',
  border: '1px solid var(--border-color)',
};

export const ReminderPicker: React.FC<ReminderPickerProps> = ({ value, onChange, idPrefix = 'reminder' }) => {
  const [activePresetKey, setActivePresetKey] = useState<PresetKey | null>(null);
  const [mode, setMode] = useState<'preset' | 'custom'>(value ? 'custom' : 'preset');

  const datePart = useMemo(() => (value ? isoToDatePart(value) : ''), [value]);
  const timePart = useMemo(() => (value ? isoToTimePart(value) : ''), [value]);

  if (value === null) {
    return (
      <button
        type="button"
        onClick={() => {
          const initial = presets[0].compute();
          setActivePresetKey('later-today');
          setMode('preset');
          onChange(initial);
        }}
        aria-expanded={false}
        style={{
          ...chipBase,
          ...chipIdle,
          borderStyle: 'dashed',
        }}
      >
        <Plus size={12} /> Add reminder
      </button>
    );
  }

  const handlePresetClick = (preset: Preset) => {
    setActivePresetKey(preset.key);
    setMode('preset');
    onChange(preset.compute());
  };

  const handleClear = () => {
    setActivePresetKey(null);
    setMode('preset');
    onChange(null);
  };

  const handleDateChange = (newDate: string) => {
    setActivePresetKey(null);
    const next = combineDateAndTime(newDate, timePart || '09:00');
    if (next) onChange(next);
  };

  const handleTimeChange = (newTime: string) => {
    setActivePresetKey(null);
    const next = combineDateAndTime(datePart, newTime);
    if (next) onChange(next);
  };

  return (
    <div
      aria-expanded={true}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '12px',
        borderRadius: '8px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>
          <Bell size={14} /> Reminder
        </div>
        <button
          type="button"
          onClick={handleClear}
          aria-label="Remove reminder"
          style={{
            ...chipBase,
            ...chipIdle,
            padding: '4px 10px',
          }}
        >
          <X size={12} /> Clear
        </button>
      </div>

      {mode === 'preset' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {presets.map((preset) => {
            const active = activePresetKey === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => handlePresetClick(preset)}
                style={{ ...chipBase, ...(active ? chipActive : chipIdle) }}
              >
                {preset.label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setMode('custom')}
            style={{ ...chipBase, ...chipIdle }}
          >
            Custom…
          </button>
        </div>
      )}

      {mode === 'custom' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          <input
            id={`${idPrefix}-date`}
            type="date"
            className="input"
            aria-label="Reminder date"
            value={datePart}
            onChange={(e) => handleDateChange(e.target.value)}
            style={{ flex: '1 1 160px', minWidth: '160px' }}
          />
          <input
            id={`${idPrefix}-time`}
            type="time"
            className="input"
            aria-label="Reminder time"
            value={timePart}
            onChange={(e) => handleTimeChange(e.target.value)}
            style={{ flex: '1 1 120px', minWidth: '120px' }}
          />
          <button
            type="button"
            onClick={() => setMode('preset')}
            style={{ ...chipBase, ...chipIdle }}
          >
            ← Presets
          </button>
        </div>
      )}

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent)' }}>
        <Clock size={12} />
        <span>Reminder set for {formatReminderLabel(value)}</span>
      </div>
    </div>
  );
};
