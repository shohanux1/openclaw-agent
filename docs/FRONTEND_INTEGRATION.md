Frontend Integration Guide - Silo CRM Chat Response Parser

Overview:
The Silo AI agent returns responses in a structured format with special markers for charts and loading states. This guide explains how to parse and render these responses.

---

Response Markers:

1. [CHART_INTENT]
   - Appears at the START of response when a chart will be included
   - Use this to show a loading/skeleton state for the chart
   - Always comes before any text content

2. [CHART_DATA]...[/CHART_DATA]
   - Contains JSON payload for chart rendering
   - Appears after the text summary
   - JSON is on a single line for easy parsing

---

Response Format Examples:

Example 1 - Response WITH chart:

[CHART_INTENT]
Here's your pipeline overview for this week.

You have 15 total leads across 3 stages.

[CHART_DATA]
{"type":"bar","title":"Leads by Stage","data":[{"label":"Active","value":10},{"label":"Pending","value":3},{"label":"Closed","value":2}]}
[/CHART_DATA]

Most activity is in the Active stage.


Example 2 - Response WITHOUT chart (simple data):

You have 2 leads, both in the Active stage.


Example 3 - Response WITHOUT chart (single data point):

Your total pipeline value is $50,000.

---

Chart Data Schema:

TypeScript interfaces:

interface SimpleChartData {
  type: 'bar' | 'pie' | 'line' | 'area' | 'donut' | 'horizontalBar';
  title: string;
  data: Array<{
    label: string;
    value: number;
  }>;
}

interface MultiSeriesChartData {
  type: 'bar' | 'line' | 'area';
  title: string;
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
    }>;
  };
}

type ChartData = SimpleChartData | MultiSeriesChartData;

---

Chart Types:

1. bar - Vertical bar chart for comparing categories
   Use case: Leads by stage, leads by source

2. horizontalBar - Horizontal bar chart
   Use case: Rankings, comparisons with long labels

3. pie - Pie chart for distribution
   Use case: Lead source distribution, stage breakdown

4. donut - Donut chart (pie with center hole)
   Use case: Same as pie, modern look

5. line - Line chart for trends
   Use case: Leads over time, revenue trend

6. area - Area chart (filled line)
   Use case: Cumulative metrics, volume over time

---

Parsing Logic (TypeScript):

interface ParsedResponse {
  hasChartIntent: boolean;
  chartData: ChartData | null;
  textContent: string;
}

function parseAgentResponse(response: string): ParsedResponse {
  // Check for chart intent marker
  const hasChartIntent = response.includes('[CHART_INTENT]');

  // Extract chart data
  let chartData: ChartData | null = null;
  const chartMatch = response.match(/\[CHART_DATA\]\s*([\s\S]*?)\s*\[\/CHART_DATA\]/);

  if (chartMatch && chartMatch[1]) {
    try {
      chartData = JSON.parse(chartMatch[1].trim());
    } catch (error) {
      console.error('Failed to parse chart data:', error);
      chartData = null;
    }
  }

  // Clean text content (remove all markers)
  const textContent = response
    .replace('[CHART_INTENT]', '')
    .replace(/\[CHART_DATA\][\s\S]*?\[\/CHART_DATA\]/g, '')
    .trim();

  return {
    hasChartIntent,
    chartData,
    textContent
  };
}

---

React Component Example:

import { BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

interface ChatMessageProps {
  content: string;
  isStreaming: boolean;
}

function ChatMessage({ content, isStreaming }: ChatMessageProps) {
  const { hasChartIntent, chartData, textContent } = parseAgentResponse(content);

  // Determine if we should show chart loading state
  const showChartLoading = isStreaming && hasChartIntent && !chartData;

  return (
    <div className="chat-message">
      {/* Text content */}
      {textContent && (
        <div className="message-text">
          {textContent.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      {/* Chart loading skeleton */}
      {showChartLoading && (
        <div className="chart-skeleton">
          <div className="skeleton-animation" />
          <span>Generating chart...</span>
        </div>
      )}

      {/* Actual chart */}
      {chartData && (
        <div className="chart-container">
          <h4>{chartData.title}</h4>
          <ChartRenderer data={chartData} />
        </div>
      )}
    </div>
  );
}

function ChartRenderer({ data }: { data: ChartData }) {
  // Check if it's multi-series data
  const isMultiSeries = data.data && 'labels' in data.data;

  // For multi-series, transform data for Recharts
  const chartData = isMultiSeries
    ? transformMultiSeriesData(data.data)
    : data.data;

  switch (data.type) {
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8">
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );

    case 'pie':
    case 'donut':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={data.type === 'donut' ? 60 : 0}
              outerRadius={100}
              label={({ label, percent }) => `${label}: ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );

    case 'line':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      );

    case 'area':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="value" fill="#8884d8" stroke="#8884d8" />
          </AreaChart>
        </ResponsiveContainer>
      );

    case 'horizontalBar':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <XAxis type="number" />
            <YAxis dataKey="label" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8">
              {chartData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );

    default:
      return null;
  }
}

// Transform multi-series data for Recharts
function transformMultiSeriesData(data: { labels: string[]; datasets: Array<{ label: string; data: number[] }> }) {
  return data.labels.map((label, index) => {
    const point: any = { label };
    data.datasets.forEach(dataset => {
      point[dataset.label] = dataset.data[index];
    });
    return point;
  });
}

---

CSS Styles:

.chat-message {
  padding: 16px;
  margin: 8px 0;
}

.message-text p {
  margin: 8px 0;
  line-height: 1.5;
}

.chart-container {
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.chart-container h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666;
}

.chart-skeleton {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: #f0f0f0;
  border-radius: 8px;
  margin-top: 16px;
}

.skeleton-animation {
  width: 80%;
  height: 120px;
  background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

---

Edge Cases to Handle:

1. No chart intent but chart data present
   - Rare but possible, render chart without loading state

2. Chart intent but no chart data
   - Agent decided not to include chart after all
   - Just show text, no error

3. Invalid JSON in chart data
   - Log error, show text only
   - Don't break the UI

4. Empty data array
   - Don't render empty chart
   - Show text only

5. Streaming response
   - Text appears first
   - Show loading when [CHART_INTENT] detected
   - Render chart when [/CHART_DATA] received

---

Dependencies:

npm install recharts

---

Notes:

- Agent uses plain text (no markdown) for text content
- Charts are only included when data is meaningful (2+ non-zero values)
- JSON is always on single line between markers for reliable parsing
- [CHART_INTENT] always appears at the very start of response
