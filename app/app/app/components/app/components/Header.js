import { useState } from "react";
import { Search, Bell, Star, Menu, X, Wallet } from "lucide-react";

export default function Header() {
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="flex flex-col w-full max-w-full">
      {/* Single Header Bar */}
      <div className="sticky top-0 z-50 bg-[#13171C] bg-opacity-90 backdrop-blur-sm border-b border-[#1F252B] px-4 md:px-6 py-4 w-full max-w-full">
        <div className="flex items-center justify-between w-full max-w-full">
          {/* Left: Dashboard Title */}
          <div className="flex items-center">
            <h1 className="text-white font-poppins font-bold text-xl md:text-2xl">
              Arbitrage Dashboard
            </h1>
          </div>

          {/* Center: Navigation and Search */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center max-w-2xl">
            {/* Navigation Links */}
            <div className="flex items-center space-x-8">
              <button className="flex items-center space-x-2 group">
                <div className="w-2 h-2 bg-[#14F195] rounded-full group-hover:bg-[#2bff9f] transition-colors duration-150"></div>
                <span className="text-white font-poppins font-bold text-sm group-hover:text-[#F0F4F8] transition-colors duration-150">
                  Live
                </span>
              </button>
              <button className="text-white font-poppins font-normal text-sm hover:text-[#F0F4F8] active:text-[#CED3D8] transition-colors duration-150">
                Analytics
              </button>
              <button className="text-white font-poppins font-normal text-sm hover:text-[#F0F4F8] active:text-[#CED3D8] transition-colors duration-150">
                DEXes
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-[#6B7683]" />
                </div>
                <input
                  type="text"
                  placeholder="Search tokens, pairs..."
                  className="w-full pl-10 pr-4 py-2 bg-[#1A1F25] border border-[#1F252B] rounded-full text-white placeholder-[#6B7683] focus:outline-none focus:ring-2 focus:ring-[#9945FF] focus:border-transparent hover:border-[#374151] transition-all duration-200 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Mobile: Navigation and Search */}
          <div className="md:hidden flex-1 mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-[#6B7683]" />
              </div>
              <input
                type="text"
                placeholder="Search tokens..."
                className="w-full pl-8 pr-4 py-2 bg-[#1A1F25] border border-[#1F252B] rounded-full text-white placeholder-[#6B7683] focus:outline-none focus:ring-2 focus:ring-[#9945FF] focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Right: Wallet, Notifications and Profile */}
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <button
              className="md:hidden w-8 h-8 flex items-center justify-center text-white hover:bg-[#1A1F25] active:bg-[#1F252B] rounded-lg transition-colors duration-150"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Wallet Connect Button */}
            <button className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-lg hover:from-[#b366ff] hover:to-[#2bff9f] active:scale-95 transition-all duration-150">
              <Wallet className="h-4 w-4 text-white" />
              <span className="text-white font-poppins font-medium text-sm">
                Connect
              </span>
            </button>

            {/* Notification button */}
            <button className="relative w-10 h-10 bg-transparent border border-[#1F252B] rounded-lg flex items-center justify-center hover:bg-[#1A1F25] hover:border-[#374151] active:bg-[#1F252B] active:scale-95 transition-all duration-150">
              <Bell className="h-5 w-5 text-[#F9FAFB]" />
              {/* Notification dot */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#14F195] rounded-full animate-pulse"></div>
            </button>

            {/* Profile avatar */}
            <div className="relative">
              <button
                className="w-10 h-10 bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-lg flex items-center justify-center hover:ring-2 hover:ring-[#9945FF] active:scale-95 transition-all duration-150"
                onMouseEnter={() => setShowProfileCard(true)}
                onMouseLeave={() => setShowProfileCard(false)}
              >
                <span className="text-white font-bold text-sm">A</span>
              </button>

              {/* Profile hover card - Hidden on mobile */}
              {showProfileCard && (
                <div
                  className="hidden md:block absolute top-full right-0 mt-2 bg-[#1A1F25] rounded-xl p-4 shadow-xl border border-[#1F252B] w-64 z-50"
                  onMouseEnter={() => setShowProfileCard(true)}
                  onMouseLeave={() => setShowProfileCard(false)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">A</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-poppins font-bold text-base">
                          Arbitrager
                        </span>
                        <div className="w-4 h-4 bg-[#14F195] rounded-full flex items-center justify-center">
                          <Star
                            className="h-3 w-3 text-[#0D0F11]"
                            fill="currentColor"
                          />
                        </div>
                      </div>
                      <p className="text-[#6B7683] font-poppins text-sm">
                        7xKs...9mPq
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {showMobileMenu && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowMobileMenu(false)}
        >
          <div className="bg-[#0D0F11] w-full max-w-[256px] h-full">
            <div className="p-4">
              <nav className="space-y-2">
                <button className="w-full flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-br from-[#9945FF] to-[#14F195] bg-opacity-10 hover:bg-opacity-20 active:bg-opacity-30 transition-all duration-150">
                  <span className="text-white font-medium text-sm">
                    Dashboard
                  </span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-[#1A1F25] active:bg-[#1F252B] transition-all duration-150">
                  <span className="text-[#6F7480] font-medium text-sm hover:text-[#AEB4C4]">
                    Live
                  </span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-[#1A1F25] active:bg-[#1F252B] transition-all duration-150">
                  <span className="text-[#6F7480] font-medium text-sm hover:text-[#AEB4C4]">
                    Analytics
                  </span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-[#1A1F25] active:bg-[#1F252B] transition-all duration-150">
                  <span className="text-[#6F7480] font-medium text-sm hover:text-[#AEB4C4]">
                    DEXes
                  </span>
                </button>
              </nav>
              
              {/* Mobile Wallet Connect */}
              <div className="mt-6">
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-lg hover:from-[#b366ff] hover:to-[#2bff9f] active:scale-95 transition-all duration-150">
                  <Wallet className="h-4 w-4 text-white" />
                  <span className="text-white font-poppins font-medium text-sm">
                    Connect Wallet
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Font import */
