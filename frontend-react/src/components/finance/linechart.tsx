import { useEffect, useRef } from "react";
import * as echarts from "echarts";

interface LineChartProps {
  xDataSeries: (string | number)[];
  yDataSeries: number[];
  title?: string;
  xTitle?: string;
  yTitle?: string;
}

export default function LineChart({
  xDataSeries,
  yDataSeries,
  title = "",
  xTitle = "",
  yTitle = "",
}: LineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {

    // Initialize chart
    if (chartRef.current && !chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    if (!chartInstance.current || !xDataSeries.length || !yDataSeries.length) {
      return;
    }

    const option = {
      title: {
        text: title,
        textStyle: { fontSize: 12, color: "#353535" },
      },
      tooltip: {
        trigger: "axis",
      },
      xAxis: {
        type: "category",
        name: xTitle,
        data: xDataSeries,
        axisLine: { lineStyle: { color: "#d9d9d9" } },
        axisLabel: { color: "#666" },
      },
      yAxis: {
        type: "value",
        name: yTitle,
        axisLine: { lineStyle: { color: "#d9d9d9" } },
        axisLabel: {
          color: "#666",
          formatter: "{value}",
        },
      },
      series: [
        {
          data: yDataSeries,
          type: "line",
          smooth: true,
          itemStyle: { color: "#ee6c4d" },
          lineStyle: { color: "#ee6c4d", width: 3 },
          areaStyle: { color: "rgba(238, 108, 77, 0.3)" },
        },
      ],
    };

    chartInstance.current.setOption(option);
    chartInstance.current.resize();

    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [xDataSeries, yDataSeries, title, xTitle, yTitle]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show loading or error state when no data
  if (!xDataSeries?.length || !yDataSeries?.length) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (<div ref={chartRef} style={{ width: "100%", height: "100%" }} />);
}
