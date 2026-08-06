import { useState } from "react";
import "./App.css";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <BrowserRouter>
        {/* <AppInitializer> */}
        <AppRoutes />
        {/* </AppInitializer> */}

        {/* <h1 className="text-3xl font-bold underline">Hello world!</h1> */}
      </BrowserRouter>
      {/* <h1 className="text-3xl font-bold underline text-center">Hello world!</h1>

      <div className="bg-primary text-primary-content/60">
        Primary-content color with 60% opacity
      </div>

      <button className="btn btn-primary">Button</button> */}
    </>
  );
}

export default App;
