"use client";

const marks = [
  ["✳","8%","19s","-3s"],["◌","16%","23s","-11s"],["✦","25%","21s","-6s"],
  ["✧","34%","26s","-16s"],["◉","43%","20s","-8s"],["✳","52%","24s","-13s"],
  ["✦","61%","22s","-4s"],["◌","70%","25s","-18s"],["✧","79%","21s","-9s"],
  ["◉","88%","27s","-14s"],["✳","95%","23s","-5s"]
] as const;

export default function BrandRain() {
  return (
    <div id="brand-rain" aria-hidden="true">
      {marks.map(([mark, x, duration, delay], index) => (
        <span key={index} style={{ "--x": x, "--size": `${18 + (index % 4) * 9}px`, "--duration": duration, "--delay": delay } as React.CSSProperties}>{mark}</span>
      ))}
    </div>
  );
}
