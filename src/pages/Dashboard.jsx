import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import axios from "../utils/axios";
import "../styles/Dashboard.css";
import MonthlyReport from "../components/MonthlyReport";

function Dashboard() {
  const [staffCount, setStaffCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [allAttendance, setAllAttendance] = useState([]);
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

      // Keep all records for the monthly report
      setAllAttendance(allAttendance);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
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

            {/* Monthly Attendance Report */}
            <MonthlyReport attendance={allAttendance} />
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
