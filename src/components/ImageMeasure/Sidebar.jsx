import React from "react";
import { formatLength, formatArea, dist, polygonAreaPixels } from "./utils";

export default function Sidebar({
  // keep the same props you already pass from ImageMeasure
  onUpload,
  calRealMeters,
  setCalRealMeters,
  calPts,
  scaleMetersPerPx,
  currentPoints,
  liveMetrics,
  savedShapes,
}) {
  return (
    <div className="p-6 space-y-4 bg-gray-200 rounded shadow-md min-w-[22rem]">
      {/* Upload tile */}
      <div
        className="
          w-48 h-32
          flex flex-col items-center justify-center gap-2
          border-2 border-dashed border-gray-300
          rounded-xl cursor-pointer
          hover:border-blue-500 hover:bg-blue-50
          transition-all duration-200
          text-gray-600 text-xs lg:text-lg font-medium
          relative
        "
        title="Upload image (click)"
      >
        <div className="text-xs lg:text-lg font-medium">Click to Upload Image</div>
        <div className="text-xs lg:text-lg text-gray-400">PNG, JPG</div>

        <input
          type="file"
          accept="image/*"
          onChange={onUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload image"
        />
      </div>

      {/* Calibration */}
      <div>
        <div className="font-semibold">Calibration</div>
        <div className="text-xs lg:text-lg mb-1">Click Calibrate & then two points</div>

        <input
          type="number"
          className="p-1 border rounded w-full"
          value={calRealMeters}
          onChange={(e) => setCalRealMeters(Number(e.target.value))}
        />

        <div className="mt-1 text-xs lg:text-lg">Points: {calPts.length}/2</div>
        <div className="text-xs lg:text-lg">
          {scaleMetersPerPx
            ? `Scale: ${scaleMetersPerPx.toExponential(6)} m/px`
            : "Not calibrated"}
        </div>
      </div>

      {/* Current Shape */}
      <div>
        <div className="font-semibold">Current shape</div>
        <div>Points: {currentPoints.length}</div>

        {liveMetrics ? (
          liveMetrics.type === "line" ? (
            <div>Length: {formatLength(liveMetrics.meters)}</div>
          ) : (
            <div>Area: {formatArea(liveMetrics.m2)}</div>
          )
        ) : (
          <div className="text-xs lg:text-lg text-gray-400">Draw to see live measurements</div>
        )}
      </div>

      {/* Saved Shapes */}
      <div>
        <div className="font-semibold">Saved shapes</div>
        <div className="max-h-40 overflow-auto">
          {savedShapes.length === 0 && (
            <div className="text-xs lg:text-lg text-gray-400">No shapes</div>
          )}

          {savedShapes.map((s, i) => {
            if (s.type === "line") {
              let pxlen = 0;
              for (let j = 0; j < s.points.length - 1; j++)
                pxlen += dist(s.points[j], s.points[j + 1]);

              const meters = scaleMetersPerPx ? pxlen * scaleMetersPerPx : null;

              return (
                <div key={i} className="py-1 border-b">
                  Line #{i + 1}: {meters ? formatLength(meters) : "No scale"}
                </div>
              );
            }

            // Polygon
            const pxArea = polygonAreaPixels(s.points);
            const m2 = scaleMetersPerPx ? pxArea * scaleMetersPerPx * scaleMetersPerPx : null;

            return (
              <div key={i} className="py-1 border-b">
                Polygon #{i + 1}: {m2 ? formatArea(m2) : "No scale"}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
