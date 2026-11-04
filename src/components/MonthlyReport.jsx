import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../styles/MonthlyReport.css";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const fmt = (n) => n.toLocaleString("en-IN");
const keyOf = (y, m) => `${y}-${m}`;

// Group attendance records by year + month
function groupByMonth(list) {
  const map = {};
  list.forEach((a) => {
    const d = new Date(a.date);
    if (isNaN(d)) return;
    const k = keyOf(d.getFullYear(), d.getMonth());
    if (!map[k]) {
      map[k] = {
        year: d.getFullYear(),
        month: d.getMonth(),
        total: 0,
        staff: new Set(),
        sites: {},
      };
    }
    const g = map[k];
    g.total += 1;
    g.staff.add(String(a.staff_Id));
    const loc = a.location || "Unknown";
    g.sites[loc] = (g.sites[loc] || 0) + 1;
  });

  Object.values(map).forEach((g) => {
    g.staffCount = g.staff.size;
    const top = Object.entries(g.sites).sort((a, b) => b[1] - a[1])[0];
    g.site = top ? top[0] : "-";
  });
  return map;
}

function MonthlyReport({ attendance }) {
  const [now] = useState(() => new Date());
  const grouped = useMemo(() => groupByMonth(attendance), [attendance]);

  // Years found in the data (new years appear automatically)
  const years = useMemo(() => {
    const set = new Set(Object.values(grouped).map((g) => g.year));
    set.add(now.getFullYear());
    return [...set].sort((a, b) => a - b);
  }, [grouped, now]);

  const [view, setView] = useState("year");
  const [year, setYear] = useState(now.getFullYear());
  const [selected, setSelected] = useState(null);

  // Build the list of months shown in the chart
  const months = useMemo(() => {
    const list = [];
    if (view === "year") {
      for (let m = 0; m < 12; m++) list.push({ year, month: m });
    } else {
      const all = Object.values(grouped).sort(
        (a, b) => a.year - b.year || a.month - b.month
      );
      if (all.length === 0) return [];
      let y = all[0].year;
      let m = all[0].month;
      while (y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth())) {
        list.push({ year: y, month: m });
        m++;
        if (m > 11) { m = 0; y++; }
      }
    }
    return list.map((x) => {
      const g = grouped[keyOf(x.year, x.month)];
      const future =
        x.year > now.getFullYear() ||
        (x.year === now.getFullYear() && x.month > now.getMonth());
      const inProgress =
        x.year === now.getFullYear() && x.month === now.getMonth();
      return {
        key: keyOf(x.year, x.month),
        year: x.year,
        month: x.month,
        name: MONTHS[x.month],
        label: view === "all" ? `${MONTHS[x.month]} '${String(x.year).slice(2)}` : MONTHS[x.month],
        full: `${MONTHS[x.month]} ${x.year}`,
        attendance: g ? g.total : 0,
        staff: g ? g.staffCount : 0,
        site: g ? g.site : "-",
        hasData: !!g,
        future,
        inProgress,
      };
    });
  }, [grouped, view, year, now]);

  const withData = months.filter((m) => m.hasData);
  const completed = withData.filter((m) => !m.inProgress);
  const total = withData.reduce((a, m) => a + m.attendance, 0);
  const best = completed.reduce(
    (a, m) => (!a || m.attendance > a.attendance ? m : a),
    null
  );
  const avgBase = completed.length ? completed : withData;
  const avg = avgBase.length
    ? Math.round(avgBase.reduce((a, m) => a + m.attendance, 0) / avgBase.length)
    : 0;

  const selectedMonth =
    months.find((m) => m.key === selected && m.hasData) ||
    withData[withData.length - 1] ||
    null;

  // Year-by-year table for the "All time" view
  const yearRows = useMemo(() => {
    const byYear = {};
    months.filter((m) => m.hasData).forEach((m) => {
      if (!byYear[m.year]) byYear[m.year] = [];
      byYear[m.year].push(m);
    });
    return Object.keys(byYear).map((y) => {
      const list = byYear[y];
      const done = list.filter((m) => !m.inProgress);
      const base = done.length ? done : list;
      const bst = base.reduce((a, m) => (!a || m.attendance > a.attendance ? m : a), null);
      return {
        year: y,
        total: list.reduce((a, m) => a + m.attendance, 0),
        months: list.length,
        best: `${bst.name} (${fmt(bst.attendance)})`,
        avg: Math.round(base.reduce((a, m) => a + m.attendance, 0) / base.length),
      };
    });
  }, [months]);

  const changeText = (i) => {
    const m = withData[i];
    if (m.inProgress) return { text: "In progress", cls: "" };
    const prev = withData[i - 1];
    if (!prev || prev.attendance === 0) return { text: "-", cls: "" };
    const p = Math.round(((m.attendance - prev.attendance) / prev.attendance) * 100);
    return { text: `${p > 0 ? "+" : ""}${p}%`, cls: p >= 0 ? "up" : "down" };
  };

  const downloadCsv = () => {
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const header = ["Month", "Attendance", "Staff attended", "Busiest site"];
    const rows = withData.map((m) => [m.full, m.attendance, m.staff, m.site]);
    const csv = [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = view === "year" ? `attendance-${year}.csv` : "attendance-all-time.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const firstYear = years[0];

  return (
    <div className="graph-card report-card">
      <div className="report-head">
        <div>
          <h2 className="graph-title">Monthly Attendance Report</h2>
          <p className="graph-subtitle">
            {view === "year"
              ? `Attendance marked in each month of ${year}`
              : "Attendance marked every month since the project started"}
          </p>
        </div>
        <button
          className="report-btn outline"
          onClick={downloadCsv}
          disabled={withData.length === 0}
        >
          Download CSV
        </button>
      </div>

      <div className="report-controls">
        <div className="segmented" role="group" aria-label="Report view">
          <button
            className={view === "year" ? "active" : ""}
            aria-pressed={view === "year"}
            onClick={() => { setView("year"); setSelected(null); }}
          >
            By year
          </button>
          <button
            className={view === "all" ? "active" : ""}
            aria-pressed={view === "all"}
            onClick={() => { setView("all"); setSelected(null); }}
          >
            All time
          </button>
        </div>

        {view === "year" && (
          <div className="year-tabs" role="group" aria-label="Choose year">
            {years.map((y) => (
              <button
                key={y}
                className={y === year ? "active" : ""}
                aria-pressed={y === year}
                onClick={() => { setYear(y); setSelected(null); }}
              >
                {y}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="report-stats">
        <div className="stat-box">
          <span className="stat-label">
            {view === "year" ? `Total in ${year}` : `Total since ${MONTHS[months[0]?.month ?? 0]} ${firstYear}`}
          </span>
          <span className="stat-value">{fmt(total)}</span>
          <span className="stat-note">{withData.length} months recorded</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Best month</span>
          <span className="stat-value">{best ? best.full : "-"}</span>
          <span className="stat-note">{best ? `${fmt(best.attendance)} attendance` : ""}</span>
        </div>
        <div className="stat-box">
          <span className="stat-label">Average per month</span>
          <span className="stat-value">{fmt(avg)}</span>
          <span className="stat-note">Completed months only</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={months} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#4b5563", fontSize: 12 }}
            interval={view === "all" && months.length > 14 ? 1 : 0}
          />
          <YAxis tick={{ fill: "#4b5563", fontSize: 12 }} allowDecimals={false} />
          <Tooltip
            formatter={(v) => [fmt(v), "Attendance"]}
            labelFormatter={(_, p) => (p && p[0] ? p[0].payload.full : "")}
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
            }}
          />
          <Bar
            dataKey="attendance"
            radius={[6, 6, 0, 0]}
            cursor="pointer"
            onClick={(d) => d && d.hasData && setSelected(d.key)}
          >
            {months.map((m) => (
              <Cell
                key={m.key}
                fill={selectedMonth && m.key === selectedMonth.key ? "#4f46e5" : "#a5b4fc"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {selectedMonth ? (
        <div className="selected-bar">
          <strong className="sel-title">{selectedMonth.full}</strong>
          <span><b>{fmt(selectedMonth.attendance)}</b> attendance</span>
          <span><b>{selectedMonth.staff}</b> staff attended</span>
          <span>Busiest site: <b>{selectedMonth.site}</b></span>
          {selectedMonth.inProgress && <em>This month is still in progress</em>}
        </div>
      ) : (
        <div className="selected-bar">No attendance recorded yet.</div>
      )}

      <div className="table-wrap">
        {view === "year" ? (
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Attendance</th>
                <th>Staff attended</th>
                <th>Busiest site</th>
                <th>Change vs last month</th>
              </tr>
            </thead>
            <tbody>
              {withData.map((m, i) => {
                const c = changeText(i);
                return (
                  <tr key={m.key} className={selectedMonth && m.key === selectedMonth.key ? "row-selected" : ""}>
                    <td>
                      <button className="link-btn" onClick={() => setSelected(m.key)}>
                        {m.full}
                      </button>
                    </td>
                    <td>{fmt(m.attendance)}</td>
                    <td>{m.staff}</td>
                    <td>{m.site}</td>
                    <td className={c.cls}>{c.text}</td>
                  </tr>
                );
              })}
              {withData.length === 0 && (
                <tr><td colSpan="5">No attendance recorded in {year}.</td></tr>
              )}
            </tbody>
          </table>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Attendance</th>
                <th>Months recorded</th>
                <th>Best month</th>
                <th>Average per month</th>
              </tr>
            </thead>
            <tbody>
              {yearRows.map((r) => (
                <tr key={r.year}>
                  <td><b>{r.year}</b></td>
                  <td>{fmt(r.total)}</td>
                  <td>{r.months}</td>
                  <td>{r.best}</td>
                  <td>{fmt(r.avg)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="report-foot">
        A new year tab is added automatically when attendance is first recorded in that year.
      </p>
    </div>
  );
}

export default MonthlyReport;
