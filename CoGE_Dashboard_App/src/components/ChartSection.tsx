import React, { useEffect, useState, useRef } from "react";
import ReactApexChart from "react-apexcharts";

interface ChartSectionProps {
  selectedVideo: string;
  timeAggr: number;
}

interface Interval {
  Startzeit: number;
  Endzeit: number;
}

interface GroupData {
  Gruppe: string;
  Aufgabentyp: string;
  Intervals: Interval[];
}

export const ChartSection: React.FC<ChartSectionProps> = ({
  selectedVideo,
  timeAggr,
}) => {
  const [chartData, setChartData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("data/task_intervals.json");
        const jsonData: GroupData[] = await response.json();

        const groupIdentifier = selectedVideo.split("_")[1].replace(".mp4", "");

        const filteredData = jsonData.filter(
          (item) => item.Gruppe === groupIdentifier
        );

        if (filteredData.length === 0) {
          setError("No data available for this video");
          setChartData(null);
          return;
        }

        // Process data into intervals for ApexCharts with multiple dumbbells per task type
        const seriesData = filteredData.flatMap((item) =>
          item.Intervals.map((interval) => ({
            x: item.Aufgabentyp,
            y: [interval.Startzeit, interval.Endzeit],
          }))
        );

        setChartData({
          series: [
            {
              data: seriesData,
            },
          ],
          options: {
            chart: {
              height: chartContainerRef.current?.offsetHeight || 300,
              type: "rangeBar",
              zoom: {
                enabled: false,
              },
            },
            colors: ["#EC7D31", "#EC7D31"],
            plotOptions: {
              bar: {
                horizontal: true,
                isDumbbell: true,
                dumbbellColors: [["#EC7D31", "#EC7D31"]],
              },
            },

            grid: {
              xaxis: {
                lines: {
                  show: true,
                },
              },
              yaxis: {
                lines: {
                  show: false,
                },
              },
            },
          },
        });

        setError(null);
      } catch (error) {
        console.warn("Error fetching data:", error);
        setError("Error fetching data");
      }
    };

    fetchData();
  }, [selectedVideo, timeAggr]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div ref={chartContainerRef} style={{ width: "100%", height: "90%" }}>
      {chartData && (
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="rangeBar"
          height={chartContainerRef.current?.offsetHeight || 300}
        />
      )}
    </div>
  );
};
