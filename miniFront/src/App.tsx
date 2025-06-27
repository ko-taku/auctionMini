import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainPage from './pages/MainPage';
import AuctionPage from './pages/AuctionPage';
import RegisterNFTPage from './pages/RegisterNFTPage';
import { WalletProvider } from './contexts/WalletContext';

function App() {

  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/auction" element={<AuctionPage />} />
          <Route path="/register" element={<RegisterNFTPage />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App
