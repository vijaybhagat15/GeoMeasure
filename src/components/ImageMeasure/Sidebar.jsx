import React from "react";
import { formatLength, formatArea, dist, polygonAreaPixels } from "./utils";

export default function Sidebar({
  // keep same props you already pass from ImageMeasure
  onUpload,
  calRealMeters,
  setCalRealMeters,
  calPts,
  scaleMetersPerPx,
  currentPoints,
  liveMetrics,
  savedShapes,
}) {
  const calibrationPxLen =
    calPts && calPts.length === 2 ? dist(calPts[0], calPts[1]) : null;

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
        <div className="text-xs mb-1 text-gray-600">
          Click <span className="font-medium">Calibrate</span>, then place two blue
          markers on the image to define a known distance. Enter the real-world
          length (meters) for that line below.
        </div>

        <label className="font-semibold">Reference distance (meters)</label>
        <input
          type="number"
          className="p-1 border rounded w-full"
          value={calRealMeters}
          onChange={(e) => setCalRealMeters(Number(e.target.value))}
          aria-label="Reference distance in meters"
        />

        <div className="mt-2 text-xs lg:text-lg">
          <strong>Calibration status:</strong>{" "}
          {calPts.length === 2 ? (
            <span className="text-green-700">2 points placed</span>
          ) : (
            <span className="text-gray-500">{calPts.length} / 2 points</span>
          )}
        </div>

        <div className="text-xs lg:text-lg">
          {calibrationPxLen !== null ? (
            <>
              <div>Pixel distance: <span className="font-medium">{Math.round(calibrationPxLen)} px</span></div>
              <div>
                Computed scale:{" "}
                <span className="font-medium">
                  {scaleMetersPerPx ? scaleMetersPerPx.toExponential(6) : "—"} m/px
                </span>
                {" "}

              </div>
              {scaleMetersPerPx ? (
                <div className="text-xs text-gray-700">
                  1 px = <span className="font-medium">{scaleMetersPerPx.toPrecision(6)} m</span>,
                  {" "}1 m = <span className="font-medium">{(1 / scaleMetersPerPx).toFixed(2)} px</span>
                </div>
              ) : null}
            </>
          ) : (
            <div className="text-xs text-gray-400">Not calibrated yet</div>
          )}
        </div>
      </div>

      {/* Current Shape */}
      <div>
        <div className="font-semibold">Current shape</div>
        <div className="text-sm text-gray-700">Points: <span className="font-medium">{currentPoints.length}</span></div>

        {liveMetrics ? (
          liveMetrics.type === "line" ? (
            <div className="mt-1 text-sm">
              <div className="text-gray-600 text-xs">Live length</div>
              <div className="font-medium">{formatLength(liveMetrics.meters)}</div>
            </div>
          ) : (
            <div className="mt-1 text-sm">
              <div className="text-gray-600 text-xs">Live area</div>
              <div className="font-medium">{formatArea(liveMetrics.m2)}</div>
            </div>
          )
        ) : (
          <div className="text-xs lg:text-lg text-gray-400">Draw to see live measurements</div>
        )}
      </div>

      {/* Saved Shapes */}
      <div>
        <div className="font-semibold">Saved shapes</div>
        <div className="max-h-40 overflow-auto mt-1 space-y-1">
          {savedShapes.length === 0 && (
            <div className="text-xs lg:text-lg text-gray-400">No shapes saved yet</div>
          )}

          {savedShapes.map((s, i) => {
            const pointsCount = s.points.length;
            // compute perimeter / length in px
            let pxPerimeter = 0;
            for (let j = 0; j < pointsCount - 1; j++) {
              pxPerimeter += dist(s.points[j], s.points[j + 1]);
            }
            // if polygon, add closing segment
            if (s.type === "polygon" && pointsCount > 2) {
              pxPerimeter += dist(s.points[pointsCount - 1], s.points[0]);
            }
            const perimeterMeters = scaleMetersPerPx ? pxPerimeter * scaleMetersPerPx : null;

            if (s.type === "line") {
              return (
                <div key={i} className="py-2 px-2 border-b bg-white rounded flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium">Line #{i + 1}</div>
                    <div className="text-xs text-gray-600">
                      Points: {pointsCount} • Length:{" "}
                      <span className="font-medium">
                        {perimeterMeters ? formatLength(perimeterMeters) : `${Math.round(pxPerimeter)} px`}
                      </span>
                    </div>
                  </div>
                  
                </div>
              );
            }

            // polygon details
            const pxArea = polygonAreaPixels(s.points);
            const m2 = scaleMetersPerPx ? pxArea * scaleMetersPerPx * scaleMetersPerPx : null;

            return (
              <div key={i} className="py-2 px-2 border-b bg-white rounded flex items-start justify-between gap-2">
                <div>
                  <div className="text-sm font-medium">Polygon #{i + 1}</div>
                  <div className="text-xs text-gray-600">
                    Points: {pointsCount} • Perimeter:{" "}
                    <span className="font-medium">
                      {perimeterMeters ? formatLength(perimeterMeters) : `${Math.round(pxPerimeter)} px`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Area:{" "}
                    <span className="font-medium">
                      {m2 ? formatArea(m2) : `${Math.round(pxArea)} px²`}
                    </span>
                  </div>
                  {m2 ? (
                    <div className="text-xs text-gray-500">({(m2 / 10000).toFixed(3)} ha)</div>
                  ) : null}
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
