import React, { useEffect, useState, useRef, useCallback } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement,
  ChartOptions,
  Plugin,
  Chart,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  PointElement
);

interface DataPoint {
  time: number;
  values: number;
}

interface DataGroup {
  [key: string]: DataPoint[];
}

interface LineChartProps {
  selectedVideo: string;
  timeAggr: number;
  videoCurrentTime: number;
  startTimeInSeconds: number;
  endTimeInSeconds: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  selectedVideo,
  timeAggr,
  videoCurrentTime,
  startTimeInSeconds,
  endTimeInSeconds,
}) => {
  const [chartData, setChartData] = useState<DataPoint[]>([]);
  const chartRef = useRef<Chart<"line"> | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const dataResponse = await fetch("/data/group_dynamics.json");
        if (!dataResponse.ok) {
          throw new Error(`HTTP error! status: ${dataResponse.status}`);
        }
        const data: DataGroup = await dataResponse.json();
        setChartData(data[selectedVideo] || []);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchChartData();
  }, [selectedVideo]);

  const drawVerticalLine = useCallback(
    (chart: Chart<"line">) => {
      if (!chart) return;

      const ctx = chart.ctx;
      const xScale = chart.scales.x;
      const topY = chart.scales.y.top;
      const bottomY = chart.scales.y.bottom;

      // Convert videoCurrentTime to chart's x-axis position (based on min/max scaling)
      const xPosition = xScale.getValueForPixel(videoCurrentTime * 1000);
      // Clear the existing line (by redrawing the chart without animations)
      chart.update("none");

      // Draw the new vertical line
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xPosition, topY);
      ctx.lineTo(xPosition, bottomY);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "red";
      ctx.stroke();
      ctx.restore();
    },
    [videoCurrentTime]
  );

  useEffect(() => {
    if (chartRef.current) {
      drawVerticalLine(chartRef.current);
    }
  }, [videoCurrentTime, drawVerticalLine]);

  const aggregateData = (data: DataPoint[], timeAggr: number): DataPoint[] => {
    const aggregated: DataPoint[] = [];
    let currentBucket: DataPoint | null = null;
    const timeAggrMs = timeAggr * 1000;

    data.forEach((point) => {
      const bucketTime = Math.floor(point.time / timeAggrMs) * timeAggrMs;

      if (currentBucket && bucketTime === currentBucket.time) {
        currentBucket.values += point.values;
      } else {
        if (currentBucket) {
          aggregated.push(currentBucket);
        }
        currentBucket = { time: bucketTime, values: point.values };
      }
    });

    if (currentBucket) {
      aggregated.push(currentBucket);
    }

    return aggregated;
  };

  const aggregatedData = aggregateData(chartData, timeAggr);

  const sampleData = (data: DataPoint[], interval: number): DataPoint[] => {
    const sampled: DataPoint[] = [];
    for (let i = 0; i < data.length; i += interval) {
      sampled.push(data[i]);
    }
    return sampled;
  };

  const sampledData = sampleData(
    aggregatedData,
    Math.ceil(aggregatedData.length / 1000)
  );

  const labels = sampledData.map((item) => item.time);
  const values = sampledData.map((item) => item.values);

  function formatTime(ms: number) {
    const date = new Date(ms);
    return date.toISOString().substr(11, 8); // Extract HH:MM:SS
  }

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Values over Time",
        data: values.map((value, index) => ({ x: labels[index], y: value })),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderWidth: 2,
        tension: 0.1,
      },
    ],
  };

  const verticalLinePlugin: Plugin<"line"> = {
    id: "verticalLinePlugin",
    afterDraw: (chart) => {
      drawVerticalLine(chart);
    },
  };

  const chartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: (context) => {
            const time = formatTime(context.parsed.x);
            const value = context.parsed.y;
            return `Time: ${time}, Value: ${value}`;
          },
        },
      },
    },
    scales: {
      x: {
        type: "linear",
        position: "bottom",
        ticks: {
          callback: (value: string | number) => formatTime(Number(value)),
        },
        min: startTimeInSeconds * 1000,
        max: endTimeInSeconds * 1000,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Line
        data={data}
        options={chartOptions}
        ref={chartRef}
        plugins={[verticalLinePlugin]}
      />
    </div>
  );
};
