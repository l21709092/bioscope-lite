
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Workspace from "./components/Workspace";
import "./index.css";

export default function App() {
  return (
    <div className="app">
      <Header />

      <div className="app-layout">
        <Sidebar />
        <Workspace />
      </div>
    </div>
  );
}
