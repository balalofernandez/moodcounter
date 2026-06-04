import Svg, { Circle, Polyline } from 'react-native-svg';
import { MOOD_MAX, MOOD_MIN } from '@/lib/mood';

interface Props {
  values: number[]; // mood values 1..10, in chronological order
  color: string;
  width?: number;
  height?: number;
}

export function Sparkline({ values, color, width = 90, height = 28 }: Props) {
  if (values.length === 0) return <Svg width={width} height={height} />;

  const pad = 3;
  const xStep = values.length > 1 ? (width - pad * 2) / (values.length - 1) : 0;
  const yFor = (v: number) =>
    height - pad - ((v - MOOD_MIN) / (MOOD_MAX - MOOD_MIN)) * (height - pad * 2);
  const points = values.map((v, i) => `${pad + i * xStep},${yFor(v)}`).join(' ');
  const last = values[values.length - 1];
  const lastX = pad + (values.length - 1) * xStep;

  return (
    <Svg width={width} height={height}>
      {values.length > 1 ? (
        <Polyline points={points} fill="none" stroke={color} strokeWidth={2} />
      ) : null}
      <Circle cx={lastX} cy={yFor(last)} r={3} fill={color} />
    </Svg>
  );
}
