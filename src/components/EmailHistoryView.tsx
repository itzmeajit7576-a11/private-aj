import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Trash2, 
  FileText, 
  Calendar, 
  ShieldAlert, 
  Eye, 
  RotateCcw,
  Sparkles
} from "lucide-react";
import { HistoryItem } from "../types/threat";
import { ThreatBadge } from "./ThreatBadge";

interface EmailHistoryViewProps {
  history: HistoryItem[];
  onSelectEmail: (item: HistoryItem) => void;
  onDeleteEmail: (id: string) => void;
  onClearAll: () => void;
}

export const EmailHistoryView: React.FC<EmailHistoryViewProps> = ({
  history,
  onSelectEmail,
  onDeleteEmail,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Filtering
  const filtered = history.filter((item) => {
    const matchesSearch =
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.threatType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === "all" ||
      item.severity.toLowerCase() === severityFilter.toLowerCase();

    return matchesSearch && matchesSeverity;
  });

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    } else {
      return sortOrder === "asc" ? a.riskScore - b.riskScore : b.riskScore - a.riskScore;
    }
  });

  const toggleSort = (type: "date" | "score") => {
    if (sortBy === type) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(type);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Threat Analysis History</span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {history.length} records
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit logs of previous mailbox threat inspections and forensic scores.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear your local analysis history?")) {
                onClearAll();
              }
            }}
            className="text-xs font-mono text-red-400 hover:text-red-300 p-2 rounded-lg bg-red-950/20 border border-red-500/20 hover:border-red-500/40 flex items-center gap-1.5 self-start md:self-auto transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by subject, sender address, or threat type..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-cyan-500/60 text-xs sm:text-sm text-slate-200 outline-none font-mono placeholder:text-slate-500"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-cyan-500/60 text-xs font-mono text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">All Threat Levels</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
            <option value="suspicious">Suspicious</option>
            <option value="safe">Safe</option>
          </select>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSort("date")}
            className={`px-3 py-2.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors ${
              sortBy === "date"
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Date {sortBy === "date" ? (sortOrder === "asc" ? "↑" : "↓") : ""}</span>
          </button>

          <button
            onClick={() => toggleSort("score")}
            className={`px-3 py-2.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors ${
              sortBy === "score"
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Risk Score {sortBy === "score" ? (sortOrder === "asc" ? "↑" : "↓") : ""}</span>
          </button>
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Subject & Sender</th>
                <th className="py-3 px-4">Threat Classification</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No threat logs found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                sorted.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {item.date}
                    </td>

                    <td className="py-3.5 px-4 max-w-[280px]">
                      <div
                        onClick={() => onSelectEmail(item)}
                        className="font-semibold text-slate-100 font-sans group-hover:text-cyan-300 transition-colors cursor-pointer truncate"
                        title={item.subject}
                      >
                        {item.subject}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {item.sender}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-slate-200 font-medium">
                        {item.threatType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`font-extrabold ${
                          item.riskScore >= 81
                            ? "text-red-400"
                            : item.riskScore >= 61
                            ? "text-orange-400"
                            : item.riskScore >= 31
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {item.riskScore}/100
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <ThreatBadge severity={item.severity} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectEmail(item)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-[11px] transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Report</span>
                        </button>

                        <button
                          onClick={() => onDeleteEmail(item.id)}
                          className="p-1.5 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
