import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import Sidebar from "../components/Sidebar";
import "../styles/dash.css";

export default function Dashboard() {

  const data = {
    labels: ["T01", "T02", "T03", "T04", "T05"],
    datasets: [
      {
        label: "Usage Count",
        data: [120, 90, 150, 70, 110],
        backgroundColor: "#3DDC84",
      },
      {
        label: "Cleanliness Score",
        data: [85, 92, 78, 88, 90],
        backgroundColor: "#0F2027",
      },
    ],
  };

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <div className="search_area">
          <div className="search_box">
            <input type="text" placeholder="Search..." />
          </div>
        </div>

        <div className="content">
          <div className="cards">
            <div className="card">
              Total Toilets <br /> <strong>25</strong>
            </div>
            <div className="card">
              Dirty Toilets <br /> <strong>5</strong>
            </div>
            <div className="card">
              Staff On Duty <br /> <strong>8</strong>
            </div>
            <div className="card">
              Alerts <br /> <strong>2</strong>
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Usage & Cleanliness Analytics</h3>
          <div className="chart">
            <Bar data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
