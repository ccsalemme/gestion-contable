import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Login from "./components/Login";
import AppLayout from "./components/AppLayout";
import SpreadsheetView from "./components/SpreadsheetView";
import FilesView from "./components/FilesView";
import ExportView from "./components/ExportView";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { path: "login", Component: Login },
      {
        path: "/",
        Component: AppLayout,
        children: [
          { index: true, Component: SpreadsheetView },
          { path: "files", Component: FilesView },
          { path: "export", Component: ExportView },
        ],
      },
    ],
  },
]);
