import React from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  PointElement, 
  LineElement 
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { ShieldCheck, ShieldAlert, Zap, Clock, Activity, Award } from 'lucide-react';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  PointElement, 
  LineElement
);

export default function ExecutiveDashboard({ scanMetrics, findings = [] }) {
  const { score = 100, grade = 'A+', criticalCount = 0, highCount = 0, mediumCount = 0, lowCount = 0, complexity = 1, maintainability = 100, totalLines = 0 } = scanMetrics || {};

  // Calculate Security Debt Hours (1.5h per Critical, 1h per High, 0.5h per Medium)
  const securityDebtHours = (criticalCount * 2.5 + highCount * 1.5 + mediumCount * 0.75).toFixed(1);

  // Doughnut Chart Data (Severity Distribution)
  const severityData = {
    labels: ['Critical', 'High', 'Medium', 'Low / Info'],
    datasets: [
      {
        data: [criticalCount, highCount, mediumCount, lowCount || (findings.length === 0 ? 1 : 0)],
        backgroundColor: [
          '#f43f5e', // rose-500
          '#f59e0b', // amber-500
          '#eab308', // yellow-500
          findings.length === 0 ? '#10b981' : '#06b6d4' // emerald / cyan
        ],
        borderColor: '#0f172a',
        borderWidth: 3
      }
    ]
  };

  // OWASP Distribution Bar Chart
  const owaspCounts = {};
  findings.forEach((f) => {
    const key = f.owasp ? f.owasp.split(' - ')[0] : 'Other';
    owaspCounts[key] = (owaspCounts[key] || 0) + 1;
  });

  const owaspData = {
    labels: Object.keys(owaspCounts).length > 0 ? Object.keys(owaspCounts) : ['A01 Access', 'A03 Injection', 'A07 Auth', 'A05 Config'],
    datasets: [
      {
        label: 'Vulnerability Count',
        data: Object.keys(owaspCounts).length > 0 ? Object.values(owaspCounts) : [0, 0, 0, 0],
        backgroundColor: '#06b6d4',
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { size: 11 } }
      }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
      y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } }
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Security Health Score Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Security Health Score</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-100">{score}/100</span>
              <span className={`text-sm font-extrabold px-2 py-0.5 rounded ${
                score >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                Grade {grade}
              </span>
            </div>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Total Flaws Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Vulnerabilities</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-100">{findings.length}</span>
              <span className="text-xs text-rose-400 font-bold">{criticalCount} Critical</span>
            </div>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Cyclomatic Complexity */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Cyclomatic Complexity</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-100">{complexity}</span>
              <span className="text-xs text-slate-400 font-medium">Branch paths</span>
            </div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Zap className="w-6 h-6" />
          </div>
        </div>

        {/* Security Remediation Debt */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Security Remediation Debt</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-100">{securityDebtHours} hrs</span>
              <span className="text-xs text-slate-400">Est. fix time</span>
            </div>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Clock className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Severity Breakdown Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Vulnerability Severity Distribution</span>
          </h3>
          <div className="h-64 flex items-center justify-center relative">
            <Doughnut data={severityData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {/* OWASP Categories Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>OWASP Top 10 Category Breakdown</span>
          </h3>
          <div className="h-64">
            <Bar data={owaspData} options={chartOptions} />
          </div>
        </div>

      </div>
    </div>
  );
}
