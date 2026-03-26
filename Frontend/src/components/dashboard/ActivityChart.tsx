"use client";

import { useState, useEffect } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { getChartData } from "@/lib/mock-data";

export default function ActivityChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Generate random mock data only on the client to avoid hydration mismatch
    setData(getChartData());
  }, []);

  if (data.length === 0) {
    return (
      <div className="h-[300px] w-full mt-4 bg-white/5 animate-pulse rounded-xl" />
    );
  }

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorContr" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2672FF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#2672FF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Area 
            type="monotone" 
            dataKey="contributions" 
            stroke="#2672FF" 
            fillOpacity={1} 
            fill="url(#colorContr)" 
            strokeWidth={3}
          />
          <Area 
            type="monotone" 
            dataKey="riskSignals" 
            stroke="#3ACBE0" 
            fill="transparent" 
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
