import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, GitCompare } from "lucide-react";
import { Municipality } from "@shared/schema";
import * as echarts from "echarts";

interface FinanceChartsProps {
  selectedMunicipality: Municipality | null;
}

export default function FinanceCharts({ selectedMunicipality }: FinanceChartsProps) {
  const assetsChartRef = useRef<HTMLDivElement>(null);
  const revenueChartRef = useRef<HTMLDivElement>(null);
  const debtChartRef = useRef<HTMLDivElement>(null);
  
  const assetsChartInstance = useRef<echarts.ECharts | null>(null);
  const revenueChartInstance = useRef<echarts.ECharts | null>(null);
  const debtChartInstance = useRef<echarts.ECharts | null>(null);

  // Initialize charts
  useEffect(() => {
    if (assetsChartRef.current && !assetsChartInstance.current) {
      assetsChartInstance.current = echarts.init(assetsChartRef.current);
    }
    if (revenueChartRef.current && !revenueChartInstance.current) {
      revenueChartInstance.current = echarts.init(revenueChartRef.current);
    }
    if (debtChartRef.current && !debtChartInstance.current) {
      debtChartInstance.current = echarts.init(debtChartRef.current);
    }

    // Cleanup function
    return () => {
      assetsChartInstance.current?.dispose();
      revenueChartInstance.current?.dispose();
      debtChartInstance.current?.dispose();
      assetsChartInstance.current = null;
      revenueChartInstance.current = null;
      debtChartInstance.current = null;
    };
  }, []);

  // Update charts when municipality changes
  useEffect(() => {
    if (!selectedMunicipality) {
      // Show default/placeholder charts
      updateAssetsChart(null);
      updateRevenueChart(null);
      updateDebtChart(null);
      return;
    }

    updateAssetsChart(selectedMunicipality);
    updateRevenueChart(selectedMunicipality);
    updateDebtChart(selectedMunicipality);
  }, [selectedMunicipality]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      assetsChartInstance.current?.resize();
      revenueChartInstance.current?.resize();
      debtChartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateAssetsChart = (municipality: Municipality | null) => {
    if (!assetsChartInstance.current) return;

    const currentAssets = municipality?.currentAssets ? parseFloat(municipality.currentAssets) / 1e9 : 8.2;
    const totalLiabilities = municipality?.totalLiabilities ? parseFloat(municipality.totalLiabilities) / 1e9 : 3.1;

    const option = {
      title: { 
        text: 'Assets vs Liabilities', 
        textStyle: { fontSize: 12, color: '#353535' } 
      },
      tooltip: { 
        trigger: 'item',
        formatter: '{a} <br/>{b}: ${c}B ({d}%)'
      },
      series: [{
        name: 'Financial Position',
        type: 'pie',
        radius: '70%',
        data: [
          { value: currentAssets, name: 'Current Assets' },
          { value: totalLiabilities, name: 'Total Liabilities' }
        ],
        itemStyle: {
          color: function(params: any) {
            return params.dataIndex === 0 ? '#3c6e71' : '#ee6c4d';
          }
        }
      }]
    };

    assetsChartInstance.current.setOption(option);
  };

  const updateRevenueChart = (municipality: Municipality | null) => {
    if (!revenueChartInstance.current) return;

    // Generate mock historical data based on current revenue
    const currentRevenue = municipality?.totalRevenue ? parseFloat(municipality.totalRevenue) / 1e9 : 13.2;
    const historicalData = [
      currentRevenue * 0.85,
      currentRevenue * 0.82,
      currentRevenue * 0.92,
      currentRevenue * 0.97,
      currentRevenue
    ];

    const option = {
      title: { 
        text: 'Revenue Trends', 
        textStyle: { fontSize: 12, color: '#353535' } 
      },
      tooltip: {
        trigger: 'axis',
        formatter: 'Revenue: ${c}B'
      },
      xAxis: { 
        type: 'category', 
        data: ['2019', '2020', '2021', '2022', '2023'],
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisLabel: { color: '#666' }
      },
      yAxis: { 
        type: 'value',
        axisLine: { lineStyle: { color: '#d9d9d9' } },
        axisLabel: { 
          color: '#666',
          formatter: '${value}B'
        }
      },
      series: [{
        data: historicalData,
        type: 'line',
        smooth: true,
        itemStyle: { color: '#3c6e71' },
        lineStyle: { color: '#3c6e71', width: 3 },
        areaStyle: { 
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(60, 110, 113, 0.3)' },
              { offset: 1, color: 'rgba(60, 110, 113, 0.05)' }
            ]
          }
        }
      }]
    };

    revenueChartInstance.current.setOption(option);
  };

  const updateDebtChart = (municipality: Municipality | null) => {
    if (!debtChartInstance.current) return;

    const debtRatio = municipality?.debtToRevenue ? parseFloat(municipality.debtToRevenue) : 23.5;

    const option = {
      title: { 
        text: 'Debt to Revenue', 
        textStyle: { fontSize: 12, color: '#353535' } 
      },
      tooltip: { 
        trigger: 'item',
        formatter: 'Debt Ratio: {c}%'
      },
      series: [{
        type: 'gauge',
        radius: '80%',
        data: [{ value: debtRatio, name: 'Debt Ratio %' }],
        detail: { 
          fontSize: 16,
          color: '#353535',
          formatter: '{value}%'
        },
        axisLine: {
          lineStyle: {
            color: [
              [0.3, '#3c6e71'], // Good (green-teal)
              [0.7, '#f4d03f'], // Caution (yellow)
              [1, '#ee6c4d']    // High (orange-red)
            ],
            width: 20
          }
        },
        pointer: {
          itemStyle: {
            color: '#353535'
          }
        },
        axisTick: {
          distance: -30,
          length: 8,
          lineStyle: {
            color: '#fff',
            width: 2
          }
        },
        splitLine: {
          distance: -30,
          length: 30,
          lineStyle: {
            color: '#fff',
            width: 4
          }
        },
        axisLabel: {
          color: 'inherit',
          distance: 40,
          fontSize: 10
        }
      }]
    };

    debtChartInstance.current.setOption(option);
  };

  const handleDownload = () => {
    // TODO: Implement chart download functionality
    console.log('Downloading charts...');
  };

  const handleCompare = () => {
    // TODO: Implement municipality comparison
    console.log('Opening comparison view...');
  };

  return (
    <div className="p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-charcoal">
          Financial Metrics - {' '}
          <span className="text-teal">
            {selectedMunicipality ? 
              `${selectedMunicipality.name}, ${selectedMunicipality.state}` : 
              'Select a Municipality'
            }
          </span>
        </h3>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCompare}
            className="text-sm"
          >
            <GitCompare className="h-4 w-4 mr-1" />
            Compare
          </Button>
          <Button 
            size="sm"
            onClick={handleDownload}
            className="bg-urban-orange hover:bg-urban-orange/90 text-sm"
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-56">
        <div className="bg-gray-50 rounded-lg p-3">
          <div ref={assetsChartRef} className="w-full h-full chart-container" />
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div ref={revenueChartRef} className="w-full h-full chart-container" />
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div ref={debtChartRef} className="w-full h-full chart-container" />
        </div>
      </div>
    </div>
  );
}
