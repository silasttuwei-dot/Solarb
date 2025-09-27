export default function Skeleton({ className }) {
  return <div className={`bg-[#1A1F25] rounded-2xl p-4 md:p-6 animate-pulse ${className}`}><div className="h-10 w-10 bg-[#23262C] rounded-lg mb-3" /><div className="h-4 bg-[#23262C] rounded mb-2" /><div className="h-6 bg-[#23262C] rounded" /></div>;
}
