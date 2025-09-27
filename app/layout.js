import '@/styles/globals.css';

export const metadata = {
  title: 'Solana Arbitrage Dashboard',
  description: 'Live DEX opportunities across Solana',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
