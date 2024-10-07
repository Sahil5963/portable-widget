import ExpandableChatbot from "./components/Bot";
import { INITIAL_MESSAGE } from "./constants";
import "./App.css";

function App() {
  const helpdeskDomain = "https://chatbot-help.aidesk.center";

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center">
      <ExpandableChatbot helpdeskDomain={helpdeskDomain} initialMessage={INITIAL_MESSAGE} />
    </div>
  );
}

export default App;
