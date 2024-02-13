// CustomToolbar.tsx
import React from "react";
import { Navigate } from "react-big-calendar";
import { Radio } from "antd";

interface ToolbarProps {
  label: string;
  onNavigate: (action: typeof Navigate) => void;
  views: string[];
  view: string;
  onView: (view: string) => void;
}

const CustomToolbar: React.FC<ToolbarProps> = ({
  label,
  onNavigate,
  views,
  view,
  onView,
}) => {
  return (
    <div
      className="custom-toolbar"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div className="view-selector">
        <Radio.Group
          onChange={(e) => onView(e.target.value)}
          defaultValue={view}
          buttonStyle="solid"
        >
          {views.map((name) => (
            <Radio.Button value={name} key={name}>
              {name === "month"
                ? "Month"
                : name === "week"
                ? "Week"
                : name === "day"
                ? "Day"
                : "List"}
            </Radio.Button>
          ))}
        </Radio.Group>
      </div>

      <span style={{ flexGrow: 1, textAlign: "center" }}>{label}</span>

       <div className="navigation-buttons">
        <Radio.Group
          buttonStyle="solid"
        >
          <Radio.Button onClick={() => onNavigate(Navigate.TODAY)} value={"TODAY"}>
            Today
          </Radio.Button>
          <Radio.Button onClick={() => onNavigate(Navigate.PREVIOUS)} value={"PREVIOUS"}>
            Back
          </Radio.Button>
          <Radio.Button onClick={() => onNavigate(Navigate.NEXT)} value={"NEXT"}>
            Next
          </Radio.Button>
        </Radio.Group>
      </div>
    </div>
  );
};

export default CustomToolbar;
