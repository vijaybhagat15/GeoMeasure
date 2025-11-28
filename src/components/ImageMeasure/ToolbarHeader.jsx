import React from "react";
import ToolbarButton from "./ToolbarButton";
import {
  MdCenterFocusStrong,
  MdTimeline,
  MdCropSquare,
  MdCheck,
  MdUndo,
  MdDeleteOutline,
  MdZoomIn,
  MdZoomOut,
  MdRefresh,
  MdPanTool,
  MdBugReport,
} from "react-icons/md";

export default function ToolbarHeader(props) {
  const {
    mode, setMode, panActive, setPanActive,
    zoomBy, zoomPercent, resetView,
    finishCurrentShape, undoLastPoint, clearAll, debugLogAll,
  } = props;

  return (
    <nav aria-label="Image tools" className="bg-gray-200 border rounded-lg p-2 relative">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-6 z-10 hidden md:block"
           style={{ background: "linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)" }} />
      <div className="pointer-events-none absolute right-0 top-0 h-full w-6 z-10 hidden md:block"
           style={{ background: "linear-gradient(270deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)" }} />

      <div
        className="flex items-center gap-2 overflow-x-auto whitespace-nowrap max-w-full scrollbar-thin scrollbar-thumb-gray-300 px-1"
        role="toolbar"
        aria-label="Toolbar buttons"
      >
        {/* Mode group */}
        <div className="flex items-center gap-1">
          <div className="flex-shrink-0">
            <ToolbarButton
              icon={<MdCenterFocusStrong className="w-full h-full" />}
              active={mode === "calibrate"}
              onClick={() => setMode("calibrate")}
              label="Calibrate"
              title="Click Calibrate, then place two blue markers on the image to define a known distance."  
            />
          </div>

          <div className="flex-shrink-0">
            <ToolbarButton
              icon={<MdTimeline className="w-full h-full" />}
              active={mode === "line"}
              onClick={() => setMode("line")}
              label="Line"
              title="Draw a line"
            />
          </div>

          <div className="flex-shrink-0">
            <ToolbarButton
              icon={<MdCropSquare className="w-full h-full" />}
              active={mode === "polygon"}
              onClick={() => setMode("polygon")}
              label="Polygon"
              title="Draw a polygon shape"
            />
          </div>
        </div>

        <div className="text-lg lg:text-xl">|</div>

        {/* Edit group */}
        <div className="flex items-center gap-1">
          <ToolbarButton icon={<MdCheck />} onClick={finishCurrentShape} label="Finish" title="Finish current shape" />
          <ToolbarButton icon={<MdUndo />} onClick={undoLastPoint} label="Undo" title="Undo last point"  />
          <ToolbarButton icon={<MdDeleteOutline />} onClick={clearAll} label="Clear" title="Delete all shapes" />
          <ToolbarButton icon={<MdBugReport />} onClick={debugLogAll} label="Debug" title="Show debug logs"/>
        </div>

        <div className="text-lg lg:text-xl">|</div>

        {/* View group */}
        <div className="flex items-center gap-1">
          <ToolbarButton icon={<MdZoomIn />} onClick={() => zoomBy(1.2)} label="Zoom In" />
          <ToolbarButton icon={<MdZoomOut />} onClick={() => zoomBy(1 / 1.2)} label="Zoom Out" />
          <ToolbarButton icon={<MdRefresh />} onClick={() => resetView(true)} label="Reset" title="Reset view" />

          <div className="text-lg lg:text-xl">|</div>

          <ToolbarButton
            icon={<MdPanTool />}
            active={panActive}
            onClick={() => { setPanActive(p => !p); if (!panActive) setMode("none"); }}
            label={panActive ? "Pan ON" : "Pan OFF"}
          />

          <div className="hidden sm:inline flex-shrink-0">
            <span className="px-2 py-0.5 bg-black/70 text-white rounded text-xs lg:text-lg ml-1">
              {zoomPercent}%
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
