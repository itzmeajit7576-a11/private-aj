import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Users, 
  FileText, 
  Download, 
  Search, 
  RefreshCw, 
  Calendar, 
  HardDrive, 
  Cloud, 
  ExternalLink, 
  X, 
  Lock, 
  ArrowRight,
  Database,
  Crown,
  KeyRound,
  CheckCircle2,
  FolderOpen
} from "lucide-react";
import { 
  ADMIN_USER_ID, 
  AdminUserRecord, 
  AdminFileRecord, 
  getAllUsersFromFirestore, 
  getUserFilesFromFirestore 
} from "../services/firebase";
import { User, HistoryItem } from "../types/threat";

interface AdminDashboardViewProps {
  currentUser: User | null;
  onNavigateToAnalyzer?: () => void;
  onSelectEmail?: (item: HistoryItem) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  currentUser,
  onNavigateToAnalyzer,
  onSelectEmail,
}) => {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUserRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Selected user for file inspection
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [userFiles, setUserFiles] = useState<AdminFileRecord[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const records = await getAllUsersFromFirestore();
      setUsers(records);
      setFilteredUsers(records);
    } catch (err) {
      console.warn("Failed to load admin users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users by search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    const q = searchQuery.toLowerCase();
    const filtered = users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.name.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  // Load files when a user is selected
  const handleSelectUser = async (userRecord: AdminUserRecord) => {
    setSelectedUser(userRecord);
    setLoadingFiles(true);
    try {
      const files = await getUserFilesFromFirestore(userRecord.id);
      setUserFiles(files);
    } catch (err) {
      console.warn("Error fetching user files:", err);
      setUserFiles([]);
    } finally {
      setLoadingFiles(false);
    }
  };

  const totalFilesCount = users.reduce((acc, u) => acc + (u.filesCount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Admin Privilege Banner */}
      <div className="p-6 rounded-2xl border-2 border-red-500/40 bg-gradient-to-r from-red-950/50 via-slate-900/90 to-amber-950/40 backdrop-blur-xl relative overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.2)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {/* Mandatory Admin Indicator Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-amber-600 text-white font-mono font-black text-xs uppercase tracking-wider shadow-lg">
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                ADMIN VIEW
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[11px] font-mono font-bold">
                <KeyRound className="w-3 h-3" />
                UID: {ADMIN_USER_ID}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono">
                <CheckCircle2 className="w-3 h-3" />
                Firestore ABAC Rules Active
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Enterprise Admin Security Console
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-mono">
              Full cross-tenant administrative audit view. Access all registered user documents from Firestore and inspect stored email evidence artifacts in Firebase Storage.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Users</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Total Registered Users</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{users.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Queried from Firestore collection (/users)</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Total Uploaded Files</span>
            <HardDrive className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">{totalFilesCount}</div>
          <p className="text-[11px] text-slate-500 mt-1">Archived in Firebase Storage Bucket</p>
        </div>

        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider">Admin Security Status</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-base font-bold text-emerald-400">UNRESTRICTED AUDIT</div>
          <p className="text-[11px] text-slate-500 mt-1">Other users restricted to own data only</p>
        </div>
      </div>

      {/* Users List & Search */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-xl p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>Registered System Users ({filteredUsers.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click on any user row to inspect their uploaded email files and evidence
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user, email, or UID..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-slate-800 focus:border-cyan-500 text-xs font-mono text-slate-200 outline-none"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th className="pb-3 px-3">User & Clearance</th>
                <th className="pb-3 px-3">Email Address</th>
                <th className="pb-3 px-3">Account Created</th>
                <th className="pb-3 px-3 text-center">Files Uploaded</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((userRecord) => {
                  const isRecordAdmin = userRecord.id === ADMIN_USER_ID;
                  return (
                    <tr
                      key={userRecord.id}
                      onClick={() => handleSelectUser(userRecord)}
                      className={`hover:bg-slate-800/40 transition-colors cursor-pointer group ${
                        selectedUser?.id === userRecord.id ? "bg-cyan-500/10 border-l-2 border-cyan-400" : ""
                      }`}
                    >
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isRecordAdmin 
                              ? "bg-red-500/20 text-red-300 border border-red-500/40" 
                              : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          }`}>
                            {userRecord.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-100 flex items-center gap-1.5">
                              <span>{userRecord.name}</span>
                              {isRecordAdmin && (
                                <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[9px] uppercase border border-red-500/30">
                                  Admin
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">
                              UID: {userRecord.id.slice(0, 12)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-slate-200 font-semibold">{userRecord.email}</span>
                        <span className="text-[10px] text-slate-500 block">{userRecord.role}</span>
                      </td>

                      <td className="py-3.5 px-3 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>
                            {new Date(userRecord.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-bold border border-slate-700">
                          {userRecord.filesCount}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectUser(userRecord);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all group-hover:border-cyan-400 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Inspect Files</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User's Uploaded Files Modal / Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl w-full max-w-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase font-bold mb-1">
                <FolderOpen className="w-4 h-4" />
                <span>User File Repository Inspection</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">
                Files Uploaded by {selectedUser.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {selectedUser.email} • UID: <span className="text-slate-200">{selectedUser.id}</span> • Total Files: {selectedUser.filesCount}
              </p>
            </div>

            {/* File List */}
            {loadingFiles ? (
              <div className="py-12 text-center text-slate-400 font-mono text-xs">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" />
                <span>Querying Firestore for user files...</span>
              </div>
            ) : userFiles.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-mono text-xs space-y-2 border border-slate-800 rounded-xl bg-black/40">
                <FileText className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                <p>No files uploaded by this user yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {userFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-4 rounded-xl bg-black/50 border border-slate-800 hover:border-cyan-500/40 transition-all font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span className="font-bold text-slate-100 truncate max-w-xs sm:max-w-md">
                          {file.fileName}
                        </span>
                        {file.riskScore !== undefined && (
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              file.riskScore >= 81
                                ? "bg-red-500/20 text-red-300"
                                : file.riskScore >= 61
                                ? "bg-orange-500/20 text-orange-300"
                                : "bg-emerald-500/20 text-emerald-300"
                            }`}
                          >
                            Score {file.riskScore}/100
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 space-x-2">
                        <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                        <span>•</span>
                        <span>{new Date(file.uploadedAt).toLocaleString()}</span>
                        <span>•</span>
                        <span className="text-slate-500 truncate max-w-[200px]">
                          {file.storagePath}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <a
                        href={file.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="Download file from Firebase Storage"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .EML</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
