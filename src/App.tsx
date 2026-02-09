import Layout from "./components/Layout";
import Home from "./components/Home";
import Login from "./components/Login";
import { AudioProvider, useAudioContext } from "./contexts/AudioContext";
import "./App.css";

function AppContent() {
  const { isAuthenticated } = useAudioContext();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Home />
    </Layout>
  );
}

function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  );
}

export default App;




