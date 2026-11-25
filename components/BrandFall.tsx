"use client";

const marks = ["✦", "○", "＋", "◆", "✧", "●", "◇", "✳", "▪", "✦", "＋", "○"];

export default function BrandFall() {
  return (
    <div className="brand-fall" aria-hidden="true">
      {marks.map((mark, index) => <span key={index} className={`brand-fall__mark mark-${index + 1}`}>{mark}</span>)}
    </div>
  );
}
