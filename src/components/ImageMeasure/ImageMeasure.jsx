import React, { useRef, useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import { dist, polygonAreaPixels } from "./utils";
import ToolbarHeader from "./ToolbarHeader"; 

export default function ImageMeasure() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const lastObjectUrl = useRef(null);

  // zoom limits
  const MIN_SCALE = 0.1;
  const MAX_SCALE = 40;

  // image
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [imageSrc, setImageSrc] = useState(null);

  // calibration
  const [calPts, setCalPts] = useState([]);
  const [calRealMeters, setCalRealMeters] = useState(1000);
  const [scaleMetersPerPx, setScaleMetersPerPx] = useState(null);

  // drawing
  const [mode, setMode] = useState("none"); 
  const [currentPoints, setCurrentPoints] = useState([]);
  const [savedShapes, setSavedShapes] = useState([]);

  // viewport
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [initialFitScale, setInitialFitScale] = useState(1);

  // pan
  const [panActive, setPanActive] = useState(false);
  const panStateRef = useRef(null);

  useEffect(() => {
    if (calPts.length === 2 && calRealMeters > 0) {
      const pxLen = dist(calPts[0], calPts[1]);
      setScaleMetersPerPx(pxLen > 0 ? calRealMeters / pxLen : null);
    } else {
      setScaleMetersPerPx(null);
    }
  }, [calPts, calRealMeters]);

  function handleUpload(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      if (lastObjectUrl.current) URL.revokeObjectURL(lastObjectUrl.current);
      lastObjectUrl.current = url;

      imgRef.current = img;
      setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
      setImageSrc(url);
      requestAnimationFrame(() => resetView(true));
    };
    img.src = url;
  }

  useEffect(() => {
    return () => {
      if (lastObjectUrl.current) URL.revokeObjectURL(lastObjectUrl.current);
    };
  }, []);

  const resetView = useCallback((fitOnly = false) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !imgRef.current) return;
    const rect = container.getBoundingClientRect();
    const cssW = rect.width;
    const cssH = rect.height;
    const imgW = imgRef.current.naturalWidth;
    const imgH = imgRef.current.naturalHeight;
    const fit = Math.min(cssW / imgW, cssH / imgH);
    setInitialFitScale(fit);
    const newScale = fit;
    const dw = imgW * newScale;
    const dh = imgH * newScale;
    const offX = (cssW - dw) / 2;
    const offY = (cssH - dh) / 2;
    setScale(newScale);
    setOffset({ x: offX, y: offY });
  }, []);

  function resizeCanvasToDisplaySize() {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return { cssW: 0, cssH: 0 };
    const rect = container.getBoundingClientRect();
    const cssW = Math.round(rect.width);
    const cssH = Math.round(rect.height);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { cssW, cssH };
  }

function clientToImageCoords(e) {
  const canvas = canvasRef.current;
  if (!canvas || !imgRef.current) return null;
  const rect = canvas.getBoundingClientRect();
  const xInCanvas = e.clientX - rect.left;
  const yInCanvas = e.clientY - rect.top;
  const xImg = (xInCanvas - offset.x) / scale;
  const yImg = (yInCanvas - offset.y) / scale;
  return { x: xImg, y: yImg }; 
}


  // image -> canvas coordinates
  const imageToCanvas = (p) => ({ x: offset.x + p.x * scale, y: offset.y + p.y * scale });

  function handleCanvasClick(e) {
    if (!imageSrc || panActive) return;
    const pt = clientToImageCoords(e);
    if (!pt || !imgRef.current) return;
    if (pt.x < 0 || pt.y < 0 || pt.x > imgSize.w || pt.y > imgSize.h) return;

    if (mode === "calibrate") {
      if (calPts.length < 2) {
        setCalPts((s) => [...s, pt]);
      } else {
        setCalPts([pt]);
      }
      return;
    }
    if (mode === "line" || mode === "polygon") {
      setCurrentPoints((s) => [...s, pt]);
    }
  }

  const handleWheel = useCallback((e) => {
    if (!imgRef.current) return;
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const xInCanvas = e.clientX - rect.left;
    const yInCanvas = e.clientY - rect.top;
    const ZOOM_STEP = 1.12;
    const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
    let newScale = scale * factor;
    if (newScale < MIN_SCALE) newScale = MIN_SCALE;
    if (newScale > MAX_SCALE) newScale = MAX_SCALE;
    const xImg = (xInCanvas - offset.x) / scale;
    const yImg = (yInCanvas - offset.y) / scale;
    const newOffsetX = xInCanvas - xImg * newScale;
    const newOffsetY = yInCanvas - yImg * newScale;
    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  }, [scale, offset]);

  function zoomBy(factor) {
    if (!imgRef.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xInCanvas = rect.width / 2;
    const yInCanvas = rect.height / 2;
    let newScale = scale * factor;
    if (newScale < MIN_SCALE) newScale = MIN_SCALE;
    if (newScale > MAX_SCALE) newScale = MAX_SCALE;
    const xImg = (xInCanvas - offset.x) / scale;
    const yImg = (yInCanvas - offset.y) / scale;
    const newOffsetX = xInCanvas - xImg * newScale;
    const newOffsetY = yInCanvas - yImg * newScale;
    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  }

  const zoomPercent = initialFitScale > 0 ? Math.round((scale / initialFitScale) * 100) : 100;

  function handlePointerDown(e) {
    if (!panActive) return;
    panStateRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startOffsetX: offset.x,
      startOffsetY: offset.y,
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  }
  function handlePointerMove(e) {
    if (!panStateRef.current) return;
    const dx = e.clientX - panStateRef.current.startClientX;
    const dy = e.clientY - panStateRef.current.startClientY;
    setOffset({
      x: panStateRef.current.startOffsetX + dx,
      y: panStateRef.current.startOffsetY + dy,
    });
  }
  function handlePointerUp() {
    panStateRef.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
  }

  // shapes
  function finishCurrentShape() {
    if (currentPoints.length < 1) return;
    const type = mode === "line" ? "line" : "polygon";
    setSavedShapes((s) => [...s, { type, points: currentPoints }]);
    setCurrentPoints([]);
  }
  function undoLastPoint() {
    if (currentPoints.length > 0) {
      setCurrentPoints((s) => s.slice(0, -1));
    } else if (savedShapes.length > 0) {
      setSavedShapes((s) => s.slice(0, -1));
    }
  }
  function clearAll() {
    setCalPts([]);
    setScaleMetersPerPx(null);
    setCurrentPoints([]);
    setSavedShapes([]);
  }

  // draw routine
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const { cssW, cssH } = resizeCanvasToDisplaySize();
    ctx.clearRect(0, 0, cssW, cssH);

    if (!imgRef.current) {
      ctx.fillStyle = "#222";
      ctx.fillRect(0, 0, cssW, cssH);
      return;
    }

    const imgW = imgRef.current.naturalWidth;
    const imgH = imgRef.current.naturalHeight;
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    ctx.drawImage(imgRef.current, offset.x, offset.y, drawW, drawH);

    const imgToCanvas = (p) => ({ x: offset.x + p.x * scale, y: offset.y + p.y * scale });

    // saved shapes
    savedShapes.forEach((shape) => {
      const pts = shape.points;
      if (!pts || pts.length === 0) return;
      ctx.beginPath();
      const first = imgToCanvas(pts[0]);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < pts.length; i++) {
        const c = imgToCanvas(pts[i]);
        ctx.lineTo(c.x, c.y);
      }
      if (shape.type === "polygon") ctx.closePath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(0,200,0,0.95)";
      ctx.stroke();

      if (scaleMetersPerPx) {
        if (shape.type === "line") {
          let pxlen = 0;
          for (let i = 0; i < pts.length - 1; i++) pxlen += dist(pts[i], pts[i + 1]);
          const meters = pxlen * scaleMetersPerPx;
          const mid = imgToCanvas(pts[Math.floor(pts.length / 2)]);
          ctx.fillStyle = "blue";
          ctx.font = "20 px sans-serif";
          ctx.fillText(`${(meters).toFixed(2)} m`, mid.x + 6, mid.y - 6);
        } else {
          const pxArea = polygonAreaPixels(pts);
          const m2 = pxArea * scaleMetersPerPx * scaleMetersPerPx;
          const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
          const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
          const c = imgToCanvas({ x: cx, y: cy });
          ctx.fillStyle = "blue";
          ctx.font = "20px sans-serif";
          ctx.fillText(`${(m2).toFixed(2)} m²`, c.x + 6, c.y - 6);
        }
      }
    });

    // current points
    if (currentPoints.length > 0) {
      ctx.beginPath();
      const p0 = imgToCanvas(currentPoints[0]);
      ctx.moveTo(p0.x, p0.y);
      for (let i = 1; i < currentPoints.length; i++) {
        const c = imgToCanvas(currentPoints[i]);
        ctx.lineTo(c.x, c.y);
      }
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,165,0,0.95)";
      ctx.stroke();
      ctx.fillStyle = "rgba(255,165,0,0.95)";
      currentPoints.forEach((pt) => {
        const cpt = imgToCanvas(pt);
        ctx.beginPath();
        ctx.arc(cpt.x, cpt.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // calibration markers
    if (calPts.length > 0) {
      ctx.fillStyle = "rgba(0,120,255,0.95)";
      calPts.forEach((p) => {
        const c = imgToCanvas(p);
        ctx.beginPath();
        ctx.arc(c.x, c.y, 5, 0, Math.PI * 2);
        ctx.fill();
      });
      if (calPts.length === 2) {
        const a = imgToCanvas(calPts[0]);
        const b = imgToCanvas(calPts[1]);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(0,120,255,0.95)";
        ctx.stroke();
        const pxLen = dist(calPts[0], calPts[1]);
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        ctx.fillStyle = "rgba(255, 140, 0, 1)";
        ctx.font = "20px sans-serif";
        ctx.fillText(`${Math.round(pxLen)} px`, mid.x - 20, mid.y - 10);
        ctx.fillText(`${calRealMeters} m (ref)`, mid.x - 20, mid.y + 10);
      }
    }

    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(8, 8, 320, 26);
    ctx.fillStyle = "white";
    ctx.font = "13px sans-serif";
    ctx.fillText(
      `Mode: ${mode}${scaleMetersPerPx ? ` | scale: ${scaleMetersPerPx.toExponential(3)} m/px` : ""}`,
      12,
      26
    );
  }, [
    scale,
    offset,
    savedShapes,
    currentPoints,
    calPts,
    calRealMeters,
    scaleMetersPerPx,
    mode,
    imgSize,
  ]);

  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const wheelListener = (ev) => { handleWheel(ev); };
    canvas.addEventListener("wheel", wheelListener, { passive: false });
    return () => canvas.removeEventListener("wheel", wheelListener, { passive: false });
  }, [handleWheel]);

  // resize behavior
  useEffect(() => {
    function onResize() {
      if (!containerRef.current || !imgRef.current) return;
      if (initialFitScale > 0 && Math.abs(scale - initialFitScale) < 1e-9) {
        resetView(true);
      } else {
        draw();
      }
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [resetView, draw, scale, initialFitScale]);

  const liveMetrics = (() => {
    if (!scaleMetersPerPx) return null;
    if (currentPoints.length < 2) return null;
    if (mode === "line" || mode === "none") {
      let pxlen = 0;
      for (let i = 0; i < currentPoints.length - 1; i++) pxlen += dist(currentPoints[i], currentPoints[i + 1]);
      return { type: "line", meters: pxlen * scaleMetersPerPx };
    }
    if (mode === "polygon") {
      const pxArea = polygonAreaPixels(currentPoints);
      const m2 = pxArea * scaleMetersPerPx * scaleMetersPerPx;
      return { type: "polygon", m2 };
    }
    return null;
  })();

  function debugLogAll() {
    console.group("ImageMeasure debug");
    console.log("Image natural size:", imgSize);
    console.log("Calibration points (image pixels):", calPts);
    if (calPts.length === 2) {
      const pxLen = dist(calPts[0], calPts[1]);
      console.log("Calibration px length:", pxLen);
      console.log("Calibration real meters (input):", calRealMeters);
      console.log("Computed scale (m/px):", scaleMetersPerPx);
    } else {
      console.log("Calibration not complete (need 2 points).");
    }
    savedShapes.forEach((shape, i) => {
      if (shape.type === "line") {
        let pxlen = 0;
        for (let j = 0; j < shape.points.length - 1; j++) pxlen += dist(shape.points[j], shape.points[j + 1]);
        console.log(`Saved shape #${i} (line): px length = ${pxlen}, meters = ${scaleMetersPerPx ? (pxlen * scaleMetersPerPx) : "N/A"}`);
      } else {
        const pxArea = polygonAreaPixels(shape.points);
        console.log(`Saved shape #${i} (polygon): px area = ${pxArea}, m² = ${scaleMetersPerPx ? (pxArea * scaleMetersPerPx * scaleMetersPerPx) : "N/A"}`);
      }
    });
    console.groupEnd();
  }

  return (
      <>
      <div className="mb-1 mr-2">
        <ToolbarHeader
          mode={mode}
          setMode={setMode}
          panActive={panActive}
          setPanActive={(p) => {
            setPanActive(p);
            if (p) setMode((m) => (m === "calibrate" || m === "line" || m === "polygon") ? "none" : m);
          }}
          zoomBy={zoomBy}
          zoomPercent={zoomPercent}
          resetView={resetView}
          finishCurrentShape={finishCurrentShape}
          undoLastPoint={undoLastPoint}
          clearAll={clearAll}
          debugLogAll={debugLogAll}
        />
      </div>
    <div className="flex gap-4">
    <div style={{ width: 420 }}>
      <Sidebar
        onUpload={handleUpload}
        calRealMeters={calRealMeters}
        setCalRealMeters={setCalRealMeters}
        calPts={calPts}
        scaleMetersPerPx={scaleMetersPerPx}
        currentPoints={currentPoints}
        liveMetrics={liveMetrics}
        savedShapes={savedShapes}
      />
    </div>

      <div style={{ flex: 1 }} className="mr-2">
        <div
          ref={containerRef}
          style={{
            background: "#222",
            borderRadius: 6,
            overflow: "hidden",
            position: "relative",
            touchAction: "none",
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ display: "block", width: "100%", height: "100%", cursor: panActive ? "grab" : "crosshair" }}
            onClick={handleCanvasClick}
            onPointerDown={handlePointerDown}
          />
        </div>
      </div>
    </div>
    </>
  );
}
