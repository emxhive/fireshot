import { useState } from "react";
import {
  Card,
  Text,
  TextInput,
  Button,
  Switch,
  Callout,
} from "@tremor/react";
import useFireshotsAPI from "../hooks/use_fireshots_api";

interface RunSnapshotCardProps {
  onSuccess?: () => void;
}

export default function RunSnapshotCard({ onSuccess }: RunSnapshotCardProps) {
  const api = useFireshotsAPI();
  const today = new Date().toISOString().slice(0, 10);

  const [sellRate, setSellRate] = useState<string>("");
  const [snapshotDate, setSnapshotDate] = useState<string>(today);
  const [force, setForce] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const handleRun = async () => {
    if (!sellRate) {
      alert("Please enter a sell rate");
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      await api.runSnapshot({
        sell_rate: parseFloat(sellRate),
        snapshot_date: snapshotDate,
        force,
      });
      setStatus({ type: "success", msg: `Snapshot run for ${snapshotDate}` });
      onSuccess?.();
    } catch (err: any) {
      setStatus({
        type: "error",
        msg: err?.response?.data?.message ?? "Snapshot failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <Text className="font-semibold text-lg">Run Daily Snapshot</Text>

      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <Text>Date</Text>
          <TextInput
            type="tel"
            value={snapshotDate}
            onChange={(e) => setSnapshotDate(e.target.value)}
          />
        </div>

        <div>
          <Text>Sell Rate</Text>
          <TextInput
            type="number"
            placeholder="e.g. 1600"
            value={sellRate}
            onChange={(e) => setSellRate(e.target.value)}
          />
        </div>

        <div className="flex items-end gap-2">
          <Switch checked={force} onChange={setForce} />
          <Text>Force overwrite</Text>
        </div>
      </div>

      <Button
        disabled={loading}
        loading={loading}
        onClick={handleRun}
        className="mt-3 w-full md:w-auto"
      >
        Run Snapshot
      </Button>

      {status && (
        <Callout
          title={status.type === "success" ? "Success" : "Error"}
          color={status.type === "success" ? "green" : "red"}
        >
          {status.msg}
        </Callout>
      )}
    </Card>
  );
}
