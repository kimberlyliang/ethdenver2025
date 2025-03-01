import React, { useState } from 'react';
import { Link, Routes, Route, Navigate } from 'react-router-dom';
import CompetitorRoutes from './components/CompetitorRoutes';
import SponsorDashboard from './components/SponsorDashboard';
import Leaderboard from './components/Leaderboard';

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';

// Import Material Tailwind components
import { Tabs, TabsHeader, Tab } from '@material-tailwind/react';

type EthereumAddress = `0x${string}`;

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<EthereumAddress | "">("");

  // Handle wallet connection
  const handleConnect = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          const address = accounts[0].toLowerCase() as EthereumAddress;
          setWalletAddress(address);
          setWalletConnected(true);
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  // Listen for account changes
  React.useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          const address = accounts[0].toLowerCase() as EthereumAddress;
          setWalletAddress(address);
        } else {
          setWalletAddress("");
          setWalletConnected(false);
        }
      });
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  // Default event handlers for Material Tailwind components
  const defaultHandlers = {
    onPointerEnterCapture: () => {},
    onPointerLeaveCapture: () => {},
    placeholder: "",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800">
      {!walletConnected ? (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#41b8d5] via-[#56bab4] to-[#70aade] p-8">
          <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-2xl p-10 max-w-md w-full text-center">
            <h1 className="text-4xl font-bold mb-3 text-[#41b8d5]">ML Competitions</h1>
            <p className="text-gray-600 mb-8">Connect your wallet to enter the platform</p>
            <Wallet>
              <ConnectWallet>
                <button
                  onClick={handleConnect}
                  className="px-8 py-3 bg-gradient-to-r from-[#56bab4] to-[#70aade] text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300"
                >
                  Connect Wallet
                </button>
              </ConnectWallet>
            </Wallet>
          </div>
        </div>
      ) : (
        <>
          <header className="bg-white shadow-md">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between p-4">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#56bab4] to-[#70aade] flex items-center justify-center text-white font-bold text-xl">
                  ML
                </div>
                <span className="text-xl font-semibold text-[#41b8d5]">ML Competitions</span>
              </div>
              
              <div className="mb-4 md:mb-0 relative">
                <Wallet>
                  <ConnectWallet>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 rounded-full hover:bg-gray-100 transition">
                      <Avatar address={walletAddress as EthereumAddress} className="h-8 w-8 border-2 border-[#56bab4]" />
                      <Name address={walletAddress as EthereumAddress} className="text-gray-700" />
                    </div>
                  </ConnectWallet>
                  <WalletDropdown>
                    <div className="absolute right-0 mt-2 min-w-[300px] p-4 bg-white rounded-xl shadow-2xl z-50 border border-gray-100">
                      <Identity address={walletAddress as EthereumAddress} className="px-4 pt-3 pb-4 border-b border-gray-100 mb-2" hasCopyAddressOnClick>
                        <Avatar address={walletAddress as EthereumAddress} className="h-16 w-16 mb-2 border-4 border-[#56bab4]" />
                        <Name address={walletAddress as EthereumAddress} className="text-xl font-semibold text-gray-800" />
                        <Address address={walletAddress as EthereumAddress} className="text-gray-500" />
                        <EthBalance address={walletAddress as EthereumAddress} className="text-[#41b8d5] font-semibold mt-1" />
                      </Identity>
                      <WalletDropdownLink
                        icon="wallet"
                        href="https://keys.coinbase.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 hover:bg-gray-50 rounded-lg transition flex items-center"
                      >
                        Wallet
                      </WalletDropdownLink>
                      <WalletDropdownDisconnect className="px-4 py-3 mt-1 text-red-500 hover:bg-red-50 rounded-lg transition w-full text-left" />
                    </div>
                  </WalletDropdown>
                </Wallet>
              </div>

              {/* Navigation tabs with updated styling */}
              <div className="w-full md:w-auto">
                <Tabs value="compete" className="bg-transparent">
                  <TabsHeader className="bg-gray-100 p-1 rounded-lg" {...defaultHandlers}>
                    <Tab value="compete" 
                      className="py-2 px-6 rounded-md font-medium"
                      activeClassName="bg-gradient-to-r from-[#56bab4] to-[#70aade] text-white shadow-md"
                      {...defaultHandlers}>
                      <Link to="/compete" className="flex items-center space-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10v4m0 0v4m0-4h4m-4 0H5" />
                        </svg>
                        <span>Compete</span>
                      </Link>
                    </Tab>
                    <Tab value="sponsor" 
                      className="py-2 px-6 rounded-md font-medium"
                      activeClassName="bg-gradient-to-r from-[#56bab4] to-[#70aade] text-white shadow-md"
                      {...defaultHandlers}>
                      <Link to="/sponsor" className="flex items-center space-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2v20" />
                        </svg>
                        <span>Sponsor</span>
                      </Link>
                    </Tab>
                    <Tab value="leaderboard" 
                      className="py-2 px-6 rounded-md font-medium"
                      activeClassName="bg-gradient-to-r from-[#56bab4] to-[#70aade] text-white shadow-md"
                      {...defaultHandlers}>
                      <Link to="/leaderboard" className="flex items-center space-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>Leaderboard</span>
                      </Link>
                    </Tab>
                  </TabsHeader>
                </Tabs>
              </div>
            </div>
          </header>

          <main className="container mx-auto p-4">
            <Routes>
              <Route path="/" element={<Navigate to="/compete" />} />
              <Route path="/compete/*" element={<CompetitorRoutes walletAddress={walletAddress} />} />
              <Route path="/sponsor" element={<SponsorDashboard walletAddress={walletAddress} />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Routes>
          </main>
          
          <footer className="bg-gray-800 text-white py-6 mt-auto">
            <div className="container mx-auto px-4 text-center">
              <div className="flex justify-center space-x-4 mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#56bab4] to-[#70aade] flex items-center justify-center">
                  <span className="font-bold">ML</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm">© 2025 ML Competitions. All rights reserved.</p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
