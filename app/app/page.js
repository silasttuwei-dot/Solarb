import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import ArbitrageOpportunities from "../components/ArbitrageOpportunities";
import MarketOverview from "../components/MarketOverview";

export default function HomePage() {
  return (
    <div className="flex min-h-screen bg-[#0D0F11] text-white w-full max-w-full">
      {/* Sidebar Section - Hidden on mobile, converted to mobile menu */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content Area - This is now the scroll container */}
      <div className="flex-1 min-h-screen overflow-y-auto">
        {/* Header Section - Sticky within the scroll container */}
        <Header />

        {/* Main Content */}
        <div className="p-4 md:p-6 space-y-6 md:space-y-8 w-full max-w-full">
          {/* Market Overview Section */}
          <MarketOverview />

          {/* Arbitrage Opportunities Section */}
          <ArbitrageOpportunities />
        </div>
      </div>
    </div>
  );
}
