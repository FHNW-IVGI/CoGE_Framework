import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto"; // Import necessary for Chart.js components
import "chartjs-adapter-date-fns"; // Import date adapter for time scale
import { key } from "ionicons/icons";

interface InteractionChartProps {
  selectedVideo: string;
  timeAggr: number;
  startTimeInSeconds: number; // Start time from TimelineRangePicker
  endTimeInSeconds: number; // End time from TimelineRangePicker
  keyname: string;
}

export const HandleNLP: React.FC<InteractionChartProps> = ({
  selectedVideo,
  timeAggr,
  startTimeInSeconds,
  endTimeInSeconds,
  keyname,
}) => {
  const [chartData, setChartData] = useState<any>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  function formatTime(ms: number) {
    const date = new Date(ms);
    return date.toISOString().substr(11, 8); // Extract HH:MM:SS
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`data/nlp.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const interactionValues = data[0][selectedVideo];

        // Aggregate data based on timeAggr
        const aggregatedData: any = {};

        Object.keys(interactionValues).forEach((seqNumber) => {
          const values = interactionValues[seqNumber];

          // Access statistics
          const statistics = values[keyname];

          // Convert sequence number (minutes) to seconds
          const timeInSeconds = parseInt(seqNumber, 10) * 60; // Convert to seconds

          const roundedTime = Math.floor(timeInSeconds / timeAggr) * timeAggr;

          if (!aggregatedData[roundedTime]) {
            aggregatedData[roundedTime] = {
              ...Object.keys(statistics).reduce((acc, key) => {
                acc[key] = { total: 0, count: 0 }; // Initialize total and count for each statistic
                return acc;
              }, {}),
            };
          }

          // Sum up all statistics values
          Object.entries(statistics).forEach(([key, statValue]) => {
            aggregatedData[roundedTime][key].total += statValue;
            aggregatedData[roundedTime][key].count++;
          });
        });

        const labels = Object.keys(aggregatedData).map((time) =>
          parseInt(time)
        );

        // Create datasets for each statistic
        const datasets = Object.keys(aggregatedData[labels[0]]).map(
          (metric) => {
            return {
              label: metric, // Use metric name as the dataset label
              data: labels.map((time) => {
                const { total, count } = aggregatedData[time][metric];
                return count ? total / count : 0; // Average if count > 0
              }),
              fill: false,
              borderColor: `rgba(${Math.floor(
                Math.random() * 255
              )}, ${Math.floor(Math.random() * 255)}, ${Math.floor(
                Math.random() * 255
              )}, 1)`,
            };
          }
        );

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
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context: { parsed: { x: number; y: number } }) => {
            console.log(context.parsed.x);
            const time = formatTime(context.parsed.x * 1000);
            const value = context.parsed.y;
            return `Time: ${time}, Value: ${value}`;
          },
        },
      },
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
