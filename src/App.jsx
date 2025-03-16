import "./App.css";
import { MessageProvider } from "./contextProvider";
import { AppRouter } from "./router";

function App() {
  return (
    <>
      <MessageProvider>
        <AppRouter />
      </MessageProvider>
    </>
  );
}

export default App;
