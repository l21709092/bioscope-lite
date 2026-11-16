import Header from "./components/header";
import Sidebar from "./components/sidebar";
import Workspace from "./components/workspace";
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