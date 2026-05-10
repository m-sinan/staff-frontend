import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "../utils/axios";
import "../styles/Dashboard.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [staffCount, setStaffCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [thisMonthCount, setThisMonthCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const staffRes = await axios.get("/staffs", config);
      const attendanceRes = await axios.get("/attendance", config);

      const allAttendance = attendanceRes.data;

      // Count total staffs
      setStaffCount(staffRes.data.length);

      // Count total attendance
      setAttendanceCount(allAttendance.length);

      // Count this month attendance
      const now = new Date();
      const thisMonth = allAttendance.filter((a) => {
        const date = new Date(a.date);
        return (
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()
        );
      }).length;
      setThisMonthCount(thisMonth);

      // Build monthly data for graph
      const monthly = buildMonthlyData(allAttendance);
      setMonthlyData(monthly);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const buildMonthlyData = (attendanceList) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Start with all months at 0
    const counts = {};
    months.forEach((m) => {
      counts[m] = 0;
    });

    // Count attendance per month
    attendanceList.forEach((a) => {
      const month = months[new Date(a.date).getMonth()];
      counts[month]++;
    });

    // Convert to array recharts understands
    return months.map((m) => ({
      month: m,
      attendance: counts[m],
    }));
  };

  return (
    <div>
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back, Owner!</p>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : (
          <>
            {/* Count Cards */}
            <div className="cards-container">
              <div className="count-card blue">
                <div className="card-icon">🧑‍💼</div>
                <div className="card-info">
                  <h2>{staffCount}</h2>
                  <p>Total Staffs</p>
                </div>
              </div>

              <div className="count-card purple">
                <div className="card-icon">📋</div>
                <div className="card-info">
                  <h2>{attendanceCount}</h2>
                  <p>Total Attendance</p>
                </div>
              </div>

         <div className='count-card green'>
    <div className='card-icon'>🗓️</div>
    <div className='card-info'>
        <h2>{thisMonthCount}</h2>
        <p>This Month Attendance</p>
    </div>
</div>
            </div>

            {/* Monthly Graph */}
            <div className="graph-card">
              <h2 className="graph-title">📊 Monthly Attendance Report</h2>
              <p className="graph-subtitle">
                Number of attendance marked each month
              </p>

              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={monthlyData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#888", fontSize: 13 }}
                  />
                  <YAxis tick={{ fill: "#888", fontSize: 13 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="attendance"
                    fill="#4f46e5"
                    radius={[6, 6, 0, 0]}
                    name="Attendance"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
