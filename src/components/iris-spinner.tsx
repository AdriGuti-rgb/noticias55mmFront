import { useEffect, useId, useRef } from "react";

interface IrisSpinnerProps {
  className?: string;
}

export function IrisSpinner({ className }: IrisSpinnerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const clipId = `iris-clip-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const svg = svgRef.current;
    const blades = svg?.querySelectorAll(".iris-blade");
    if (!svg || !blades?.length) return;

    const bladeCount = blades.length;
    const center = 50;
    const pivotRadius = 32;
    const tipLength = 32;
    const halfSpread = (25 * Math.PI) / 180;
    const outerLength = 140;
    const minAngle = 8;
    const maxAngle = 48;
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 5000
      : 2600;
    let elapsed = 0;
    let lastTime: number | null = null;
    let frameId = 0;

    const render = (angle: number) => {
      const radians = (angle * Math.PI) / 180;

      blades.forEach((blade, index) => {
        const bladeAngle = (index * 2 * Math.PI) / bladeCount;
        const pivotX = center + pivotRadius * Math.cos(bladeAngle);
        const pivotY = center + pivotRadius * Math.sin(bladeAngle);
        const home = bladeAngle + Math.PI;
        const tipDirection = home + radians;
        const baseOneDirection = tipDirection + halfSpread;
        const baseTwoDirection = tipDirection - halfSpread;
        const points = [
          [
            pivotX + outerLength * Math.cos(baseOneDirection),
            pivotY + outerLength * Math.sin(baseOneDirection),
          ],
          [
            pivotX + tipLength * Math.cos(tipDirection),
            pivotY + tipLength * Math.sin(tipDirection),
          ],
          [
            pivotX + outerLength * Math.cos(baseTwoDirection),
            pivotY + outerLength * Math.sin(baseTwoDirection),
          ],
        ];

        blade.setAttribute(
          "points",
          points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" "),
        );
      });
    };

    const tick = (time: number) => {
      if (lastTime !== null) elapsed += time - lastTime;
      lastTime = time;
      const phase = (elapsed % duration) / duration;
      const angle = minAngle + ((maxAngle - minAngle) * (1 - Math.cos(2 * Math.PI * phase))) / 2;
      render(angle);
      frameId = requestAnimationFrame(tick);
    };

    render(minAngle);
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className={className}
      focusable="false"
      viewBox="0 0 100 100"
    >
      <defs>
        <clipPath id={clipId}>
          <circle cx="50" cy="50" r="45.5" />
        </clipPath>
      </defs>
      <circle
        cx="50"
        cy="50"
        r="47"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1.4"
      />
      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: 8 }, (_, index) => (
          <polygon
            key={index}
            className={index % 2 ? "iris-blade iris-blade-alt" : "iris-blade"}
            fill="currentColor"
            opacity={index % 2 ? 0.86 : 1}
          />
        ))}
      </g>
      <circle cx="50" cy="50" r="1.1" fill="currentColor" opacity="0.9" />
    </svg>
  );
}