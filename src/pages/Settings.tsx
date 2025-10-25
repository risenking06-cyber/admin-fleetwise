import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, DatabaseBackup, RotateCcw, Trash2 } from "lucide-react";

const COLLECTIONS = [
  "debts",
  "destinations",
  "drivers",
  "employees",
  "groups",
  "lands",
  "plates",
  "travels",
];

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [restoreFile, setRestoreFile] = useState<File | null>(null);



  const [updateInfo, setUpdateInfo] = useState<{ isLatest: boolean; latestVersion: string } | null>(null);

  const currentVersion = import.meta.env.VITE_APP_VERSION || "1.0.0"; // set this from your vite config

  const handleCheckForUpdate = async () => {
    setLoading(true);
    setLoadingMessage("Checking for updates...");

    try {
      // Example: Check GitHub releases JSON (public)
      const res = await fetch("https://api.github.com/repos/risenking06-cyber/admin-fleetwise/releases/latest");
      const data = await res.json();

      const latestVersion = data.tag_name?.replace(/^v/, "") || "unknown";
      const isLatest = latestVersion === currentVersion;

      setUpdateInfo({ isLatest, latestVersion });

      if (isLatest) toast.success("You’re using the latest version!");
      else toast.info(`New version ${latestVersion} is available!`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to check for updates.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };


  const handleDownloadUpdate = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Downloading new version...");

      // Open your GitHub or file server page to download installer or patch
      window.electronAPI?.send?.("download-update");

      toast.success("Update download started!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to download update.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };


  const handleBackup = async () => {
    setLoading(true);
    setLoadingMessage("Backing up your database...");
    try {
      const backupData: Record<string, any[]> = {};
      for (const name of COLLECTIONS) {
        const snap = await getDocs(collection(db, name));
        backupData[name] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      }
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `firestore-backup-${new Date().toISOString()}.json`;
      a.click();
      toast.success("✅ Backup downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to backup data.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  const handleRestore = async () => {
    if (!restoreFile) return toast.error("Please upload a backup file first.");
    setLoading(true);
    setLoadingMessage("Restoring your database...");
    try {
      const text = await restoreFile.text();
      const data = JSON.parse(text);
      for (const [name, docs] of Object.entries(data)) {
        for (const item of docs as any[]) {
          const { id, ...rest } = item;
          await setDoc(doc(db, name, id), rest);
        }
      }
      toast.success("✅ Database restored successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to restore database.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
      setRestoreFile(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("⚠️ This will permanently delete ALL data. Continue?")) return;
    setLoading(true);
    setLoadingMessage("Deleting all data...");
    try {
      for (const name of COLLECTIONS) {
        const snap = await getDocs(collection(db, name));
        for (const docSnap of snap.docs) {
          await deleteDoc(doc(db, name, docSnap.id));
        }
      }
      toast.success("🔥 All collections deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete database.");
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  return (
    <div className="relative min-h-screen p-8 bg-gradient-to-br from-background via-muted to-background">
      {/* 🔹 LOADING OVERLAY */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="text-lg font-semibold">{loadingMessage || "Please wait..."}</p>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
            ⚙️ Settings
          </h1>

        </div>

        {/* Main Card */}
        <Card className="p-8 shadow-lg border border-border/50 backdrop-blur-md bg-card/60 space-y-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4 text-center">
            Database Management
          </h2>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Backup */}
            <div className="flex flex-col items-center text-center p-4 rounded-2xl border bg-muted/30 hover:bg-muted/50 transition">
              <DatabaseBackup className="w-10 h-10 text-primary mb-3" />
              <h3 className="font-semibold mb-2">Backup</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Download all data as a JSON backup file.
              </p>
              <Button onClick={handleBackup} disabled={loading} className="w-full">
                Backup Now
              </Button>
            </div>

            {/* Delete */}
            <div className="flex flex-col items-center text-center p-4 rounded-2xl border bg-muted/30 hover:bg-muted/50 transition">
              <Trash2 className="w-10 h-10 text-red-500 mb-3" />
              <h3 className="font-semibold mb-2">Delete All</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Permanently remove all collections from Firestore.
              </p>
              <Button
                variant="destructive"
                onClick={handleDeleteAll}
                disabled={loading}
                className="w-full"
              >
                Delete All
              </Button>
            </div>

            {/* Restore */}
            <div className="flex flex-col items-center text-center p-4 rounded-2xl border bg-muted/30 hover:bg-muted/50 transition">
              <RotateCcw className="w-10 h-10 text-blue-500 mb-3" />
              <h3 className="font-semibold mb-2">Restore</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Restore data from a backup JSON file.
              </p>
              <Input
                type="file"
                accept="application/json"
                onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                className="mb-3"
              />
              <Button
                onClick={handleRestore}
                disabled={loading || !restoreFile}
                className="w-full"
              >
                Restore Data
              </Button>
            </div>
          </div>
        </Card>



        {/* 🔹 App Update Section */}
        <Card className="p-8 shadow-lg border border-border/50 backdrop-blur-md bg-card/60 space-y-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4 text-center">
            App Updates
          </h2>

          {/* Show current version */}
          <p className="text-center text-sm text-muted-foreground mb-4">
            Current Version: <span className="font-medium">{currentVersion}</span>
          </p>

          <div className="flex flex-col items-center text-center p-4 rounded-2xl border bg-muted/30 hover:bg-muted/50 transition">
            <RotateCcw className="w-10 h-10 text-green-500 mb-3" />
            <h3 className="font-semibold mb-2">Check for Updates</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Check if a new version of the app is available.
            </p>
            <Button onClick={handleCheckForUpdate} disabled={loading} className="w-full">
              Check for Update
            </Button>
          </div>

          {updateInfo && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                {updateInfo.isLatest
                  ? "✅ You have the latest version!"
                  : `🆕 New version available: ${updateInfo.latestVersion}`}
              </p>
              {!updateInfo.isLatest && (
                <Button
                  onClick={handleDownloadUpdate}
                  disabled={loading}
                  className="mt-3 w-full"
                >
                  Download Update
                </Button>
              )}
            </div>
          )}
        </Card>


      </div>
    </div>
  );
}
