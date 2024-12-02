import React from "react";
import { format } from "date-fns";
import { TimelineRangePicker } from "@mblancodev/react-ts-timeline-range-picker";
import { DateValuesType } from "@mblancodev/react-ts-timeline-range-picker/dist/src/types";
import "@mblancodev/react-ts-timeline-range-picker/dist/assets/main.css";

// Helper function to reset the time without time zone issues
const toUTCDate = (date: Date) => {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    )
  );
};

const formatTime = (date: Date) => {
  return format(date, "HH:mm:ss");
};

export const CustomTimeLineRangePicker: React.FC<{
  value: DateValuesType;
  timelineInterval: [Date, Date];
  onChange: (values: DateValuesType) => void;
  step?: number;
  mode?: 1 | 2 | 3;
}> = ({ value, timelineInterval, onChange, step = 1000000, mode = 2 }) => {
  // Convert start and end values to UTC Dates
  const start = toUTCDate(new Date(value[0]));
  const end = toUTCDate(new Date(value[1]));

  return (
    <div style={{ position: "relative" }}>
      {/* Render the timeline */}
      <TimelineRangePicker
        value={value}
        timelineInterval={timelineInterval}
        onChange={onChange}
        step={step}
        mode={mode}
        ticksNumber={20}
      />

      {/* Add the time pins at the handles */}
      <div
        style={{
          position: "absolute",
          top: "-30px",
          left: `${
            ((start.getTime() - timelineInterval[0].getTime()) /
              (timelineInterval[1].getTime() - timelineInterval[0].getTime())) *
            100
          }%`,
          transform: "translateX(-50%)",
          background: "#fff",
          padding: "4px 8px",
          borderRadius: "4px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          fontSize: "12px",
        }}
      >
        {formatTime(start)}
      </div>
      <div
        style={{
          position: "absolute",
          top: "-30px",
          left: `${
            ((end.getTime() - timelineInterval[0].getTime()) /
              (timelineInterval[1].getTime() - timelineInterval[0].getTime())) *
            100
          }%`,
          transform: "translateX(-50%)",
          background: "#fff",
          padding: "4px 8px",
          borderRadius: "4px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          fontSize: "12px",
        }}
      >
        {formatTime(end)}
      </div>
    </div>
  );
};
