import React from "react";
import AppProviders from "@/components/AppProviders";
import MainRoutes from "@/routes/MainRoutes";
const App = () => (
  <AppProviders>
    <MainRoutes />
  </AppProviders>
);

export default App;
