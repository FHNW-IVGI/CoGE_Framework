import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto"; // Import necessary for Chart.js components
import "chartjs-adapter-date-fns"; // Import date adapter for time scale

interface InteractionChartProps {
  selectedVideo: string;
  timeAggr: number;
  startTimeInSeconds: number; // Start time from TimelineRangePicker
  endTimeInSeconds: number; // End time from TimelineRangePicker
  keyname: string;
}

export const InteractionChart: React.FC<InteractionChartProps> = ({
  selectedVideo,
  timeAggr,
  startTimeInSeconds,
  endTimeInSeconds,
  keyname,
}) => {
  const [chartData, setChartData] = useState<any>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`data/${selectedVideo}.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const interactionValues = data[0][keyname];

        // Helper function to check if a subKey should be skipped
        const shouldSkipSubKey = (subKey: string) => {
          return subKey.includes("cum") || subKey.includes("acc");
        };

        // Aggregate data based on timeAggr, skipping sub-keys with "cum" or "acc"
        const aggregatedData: any = {};
        Object.keys(interactionValues).forEach((key) => {
          // Extract time part from timestamp and convert to seconds
          const timePart = key.split(" ")[1]; // Get the time part of the timestamp
          const [hours, minutes, seconds] = timePart.split(":").map(Number);
          const totalSeconds = hours * 3600 + minutes * 60 + seconds;

          const roundedTime = Math.floor(totalSeconds / timeAggr) * timeAggr;
          if (!aggregatedData[roundedTime]) {
            aggregatedData[roundedTime] = {};
          }

          // Iterate through each sub-key and skip if it contains "cum" or "acc"
          Object.keys(interactionValues[key]).forEach((subKey) => {
            if (shouldSkipSubKey(subKey)) {
              return; // Skip sub-keys with "cum" or "acc"
            }

            if (!aggregatedData[roundedTime][subKey]) {
              aggregatedData[roundedTime][subKey] = [];
            }
            aggregatedData[roundedTime][subKey].push(
              interactionValues[key][subKey]
            );
          });
        });

        const labels = Object.keys(aggregatedData).map(
          (time) => parseInt(time) // Convert to seconds
        );

        const datasets = Object.keys(
          aggregatedData[Object.keys(aggregatedData)[0]]
        ).map((key) => {
          return {
            label: key,
            data: Object.keys(aggregatedData).map((time) => {
              const values = aggregatedData[time][key];
              return (
                values.reduce((a: number, b: number) => a + b, 0) /
                values.length
              );
            }),
            fill: false,
            borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(
              Math.random() * 255
            )}, ${Math.floor(Math.random() * 255)}, 1)`,
          };
        });

        setChartData({
          labels,
          datasets,
        });
      } catch (error) {
        console.warn("Error fetching or processing data:", error);
      }
    };

    fetchData();
  }, [selectedVideo, timeAggr]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: "linear", // Use linear scale
        position: "bottom",
        ticks: {
          callback: (value: number) => {
            const hours = Math.floor(value / 3600);
            const minutes = Math.floor((value % 3600) / 60);
            const seconds = Math.round(value % 60);
            return `${hours.toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
          },
        },
        min: startTimeInSeconds,
        max: endTimeInSeconds,
      },
    },
    plugins: {
      annotation: {
        annotations: {
          box: {
            type: "box",
            xMin: startTimeInSeconds, // Start time in seconds
            xMax: endTimeInSeconds, // End time in seconds
            backgroundColor: "rgba(255, 99, 132, 0.25)", // Highlight color
          },
        },
      },
    },
  };

  return (
    <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }}>
      {chartData ? (
        <Line data={chartData} options={chartOptions} />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
};
