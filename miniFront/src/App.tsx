import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainPage from './pages/MainPage';
import AuctionPage from './pages/AuctionPage';
import RegisterNFTPage from './pages/RegisterNFTPage';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/auction" element={<AuctionPage />} />
        <Route path="/register" element={<RegisterNFTPage />} />
      </Routes>
    </BrowserRouter>)
}

export default App
