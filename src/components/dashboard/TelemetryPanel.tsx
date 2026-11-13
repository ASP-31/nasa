import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { GameState } from '../../types/game';
import { TOTAL_SOL } from '../../data/gameConfig';
import { SectionCard } from '../common/SectionCard';

interface TelemetryPanelProps {
  state: GameState;
}

const TOOLTIP_STYLE = {
  backgroundColor: '#182630',
  border: '1px solid #53636D',
  borderRadius: 6,
  fontSize: 12,
  color: '#F1F4F6',
};

export function TelemetryPanel({ state }: TelemetryPanelProps) {
  const data =
    state.telemetry.length > 0
      ? state.telemetry
      : [{ sol: state.sol, energy: state.resources.energy.value, oxygen: state.resources.oxygen.value, water: state.resources.water.value, habitat: state.habitat.integrity }];

  return (
    <SectionCard title="Mission Telemetry" icon={TrendingUp}>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid stroke="#22303c" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="sol"
              tick={{ fill: '#AAB6C2', fontSize: 10 }}
              stroke="#53636D"
              domain={[1, TOTAL_SOL]}
              tickLine={false}
            />
            <YAxis tick={{ fill: '#AAB6C2', fontSize: 10 }} stroke="#53636D" tickLine={false} width={40} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#FFD166' }} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#AAB6C2' }} />
            <Line type="monotone" dataKey="energy" name="Energy (kWh)" stroke="#FFD166" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="oxygen" name="Oxygen (L)" stroke="#AAB6C2" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="water" name="Water (L)" stroke="#53636D" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
