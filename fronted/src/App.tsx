import { BrowserRouter, Routes, Route } from "react-router-dom"
import HomePage from "./components/HomePage"
import CreateRoom from "./components/CreateRoom"
import Room from "./components/Room"
import Test from "./components/Test"
import PageNotFound from "./components/PageNotFound"
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<HomePage />} path="/" />
        <Route element={<CreateRoom />} path="/create-room" />
        <Route element={<Room />} path="/room" />
        <Route element={<Test />} path="/test" />
        <Route element={<PageNotFound />} path="/*" />
      </Routes>
    </BrowserRouter>
  )
}