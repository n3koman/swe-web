import React, { useState } from "react";
import axios from "axios";

const ReportModal = ({ isOpen, onClose }) => {
  const [reportType, setReportType] = useState("sales");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateReport = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `https://swe-backend-livid.vercel.app/reports/farmer/report`,
        {
          report_type: reportType,
          date_range: [dateRange.start, dateRange.end],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReportData(response.data.data);
    } catch (err) {
      console.error(err);
      setError("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Generate Report</h2>
        <div>
          <label>
            Report Type:
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="sales">Sales</option>
              <option value="inventory">Inventory</option>
            </select>
          </label>
        </div>
        <div>
          <label>
            Start Date:
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
            />
          </label>
        </div>
        <div>
          <label>
            End Date:
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
            />
          </label>
        </div>
        <button onClick={generateReport} disabled={loading}>
          {loading ? "Generating..." : "Generate Report"}
        </button>
        <button onClick={onClose}>Close</button>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {reportData && (
          <div>
            <h3>Report Data</h3>
            <pre>{JSON.stringify(reportData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportModal;
