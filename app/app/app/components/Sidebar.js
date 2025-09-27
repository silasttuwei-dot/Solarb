import {
  LayoutGrid,
  TrendingUp,
  Bookmark,
  PieChart,
  Wallet,
  Mail,
  BadgeDollarSign,
  Users,
  Settings,
  Plus,
  Edit3,
  AlertCircle,
} from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-60 max-w-full bg-[#0D0F11] flex flex-col h-full font-poppins">
      {/* Logo Section */}
      <div className="pt-8 px-6 w-full max-w-full">
        <div className="flex items-center space-x-3 w-full max-w-full">
          {/* Solana Arbitrage Logo */}
          <div className="w-8 h-8 bg-gradient-to-br from-[#9945FF] to-[#14F195] rounded-lg flex items-center justify-center">
            <div className="text-white font-bold text-lg">S</div>
          </div>
          <h1 className="text-white font-poppins font-semibold text-xl">
            SolArb
          </h1>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 pt-12 px-6 w-full max-w-full">
        {/* First Group */}
        <div className="space-y-1 w-full max-w-full">
          {/* Dashboard - Active */}
          <button className="w-full flex items-center space-x-4 p-3 rounded-xl bg-gradient-to-br from-[#9945FF] to-[#14F195] bg-opacity-10 hover:bg-opacity-20 active:bg-opacity-30 active:scale-95 transition-all duration-150">
            <LayoutGrid size={20} className="text-[#9945FF]" />
            <span className="text-white font-medium text-[15px]">Dashboard</span>
          </button>

          {/* Arbitrage Opportunities */}
          <button className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-800 hover:bg-opacity-50 active:bg-gray-700 active:scale-95 transition-all duration-150 group">
            <TrendingUp
              size={20}
              className="text-[#6F7480] group-hover:text-[#AEB4C4] transition-colors duration-150"
            />
            <span className="text-[#6F7480] group-hover:text-[#AEB4C4] font-medium text-[15px] flex-1 transition-colors duration-150">
              Opportunities
            </span>
            <div className="w-2 h-2 bg-[#14F195] rounded-full animate-pulse"></div>
          </button>

          {/* Watchlist */}
          <button className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-800 hover:bg-opacity-50 active:bg-gray-700 active:scale-95 transition-all duration-150 group">
            <Bookmark
              size={20}
              className="text-[#6F7480] group-hover:text-[#AEB4C4] transition-colors duration-150"
            />
            <span className="text-[#6F7480] group-hover:text-[#AEB4C4] font-medium text-[15px] flex-1 transition-colors duration-150">
              Watchlist
            </span>
            <div className="w-5 h-5 bg-gray-600 group-hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors duration-150">
              <Plus size={12} className="text-white" />
            </div>
          </button>

          {/* Analytics */}
          <button className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-800 hover:bg-opacity-50 active:bg-gray-700 active:scale-95 transition-all duration-150 group">
            <PieChart
              size={20}
              className="text-[#6F7480] group-hover:text-[#AEB4C4] transition-colors duration-150"
            />
            <span className="text-[#6F7480] group-hover:text-[#AEB4C4] font-medium text-[15px] transition-colors duration-150">
              Analytics
            </span>
          </button>

          {/* Wallet */}
          <button className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-800 hover:bg-opacity-50 active:bg-gray-700 active:scale-95 transition-all duration-150 group">
            <Wallet
              size={20}
              className="text-[#6F7480] group-hover:text-[#AEB4C4] transition-colors duration-150"
            />
            <span className="text-[#6F7480] group-hover:text-[#AEB4C4] font-medium text-[15px] flex-1 transition-colors duration-150">
              Wallet
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-[#23262C] w-full max-w-full"></div>

        {/* Second Group */}
        <div className="space-y-1 w-full max-w-full">
          {/* Alerts */}
          <button className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-800 hover:bg-opacity-50 active:bg-gray-700 active:scale-95 transition-all duration-150 group">
            <Mail
              size={20}
              className="text-[#6F7480] group-hover:text-[#AEB4C4] transition-colors duration-150"
            />
            <span className="text-[#6F7480] group-hover:text-[#AEB4C4] font-medium text-[15px] flex-1 transition-colors duration-150">
              Alerts
            </span>
            <div className="flex items-center space-x-2">
              <Edit3
                size={12}
                className="text-[#9945FF] group-hover:text-[#b366ff] transition-colors duration-150"
              />
              <div className="w-5 h-5 bg-[#FF3939] group-hover:bg-[#ff5555] rounded-full flex items-center justify-center transition-colors duration-150">
                <span className="text-white text-[10px] font-medium">3</span>
              </div>
            </div>
          </button>

          {/* DEX Status */}
          <button className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-800 hover:bg-opacity-50 active:bg-gray-700 active:scale-95 transition-all duration-150 group">
            <BadgeDollarSign
              size={20}
              className="text-[#6F7480] group-hover:text-[#AEB4C4] transition-colors duration-150"
            />
            <span className="text-[#6F7480] group-hover:text-[#AEB4C4] font-medium text-[15px] flex-1 transition-colors duration-150">
              DEX Status
            </span>
            <div className="flex -space-x-2">
              <div className="w-5 h-5 bg-gradient-to-br from-[#14F195] to-[#9945FF] rounded-full border-2 border-[#0D0F11] group-hover:border-[#1A1F25] transition-colors duration-150"></div>
              <div className="w-5 h-5 bg-gradient-to-br from-[#FF6B6B] to-[#4ECDC4] rounded-full border-2 border-[#0D0F11] group-hover:border-[#1A1F25] transition-colors duration-150"></div>
              <div className="w-5 h-5 bg-gradient-to-br from-[#FFE66D] to-[#FF6B6B] rounded-full border-2 border-[#0D0F11] group-hover:border-[#1A1F25] transition-colors duration-150"></div>
            </div>
          </button>

          {/* Community */}
          <button className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-800 hover:bg-opacity-50 active:bg-gray-700 active:scale-95 transition-all duration-150 group">
            <Users
              size={20}
              className="text-[#6F7480] group-hover:text-[#AEB4C4] transition-colors duration-150"
            />
            <span className="text-[#6F7480] group-hover:text-[#AEB4C4] font-medium text-[15px] transition-colors duration-150">
              Community
            </span>
          </button>

          {/* Settings */}
          <button className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-800 hover:bg-opacity-50 active:bg-gray-700 active:scale-95 transition-all duration-150 group">
            <Settings
              size={20}
              className="text-[#6F7480] group-hover:text-[#AEB4C4] transition-colors duration-150"
            />
            <span className="text-[#6F7480] group-hover:text-[#AEB4C4] font-medium text-[15px] flex-1 transition-colors duration-150">
              Settings
            </span>
            <div className="w-2.5 h-2.5 bg-[#14F195] group-hover:bg-[#2bff9f] rounded-full flex items-center justify-center transition-colors duration-150">
              <AlertCircle size={8} className="text-white" />
            </div>
          </button>
        </div>
      </nav>

      {/* Poppins Font Import */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        .font-poppins {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>
    </div>
  );
}
