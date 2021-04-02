import React from "react";
import "./ColorList.scss";

export function ColorList(props: {
  resolve: (color: string) => void
}) {
  const colorList: string[][] = [];

  for (let hue = 0; hue < 360; hue += 5) {
    const tint: string[] = [];

    for (let sat = 40; sat <= 90; sat += 5) {
      const lux = 0.6 * sat + 20;
      tint.push(`hsl(${hue}, ${sat}%, ${lux}%)`);
    }

    colorList.push(tint);
  }

  return (
    <div className="ColorList">
      {colorList.map((tint, index) => (
        <div key={index} className="tint">
          {tint.map((shade) => (
            <div
              key={shade}
              className="shade"
              style={{ backgroundColor: shade }}
              onClick={() => props.resolve(shade)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
