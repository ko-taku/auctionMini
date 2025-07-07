import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainPage from './pages/MainPage';
import AuctionPage from './pages/AuctionPage';
import RegisterNFTPage from './pages/RegisterNFTPage';
import { WalletProvider } from './contexts/WalletContext';
import { AuthProvider } from './contexts/AuthContext';
import NavigationBar from './components/NavigationBar';
import NFTListPage from './pages/NFTListPage';

//export default면 중괄호 없이, named export면 중괄호로 import
function App() {

  return (
    <AuthProvider>
      <WalletProvider>
        <BrowserRouter>
          <NavigationBar />
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/auction" element={<AuctionPage />} />
            <Route path="/register" element={<RegisterNFTPage />} />
            <Route path="/nftlist" element={<NFTListPage />} />
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </AuthProvider>
  );
}

export default App
