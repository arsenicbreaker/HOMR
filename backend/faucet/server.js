import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// 1. Konfigurasi CORS (Hanya izinkan frontend HOMR)
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true); // Izinkan Postman/cURL
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS policy tidak mengizinkan origin ini.'), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());

// 2. Setup Provider & Wallet (BNB Smart Chain Testnet)
const provider = new ethers.JsonRpcProvider(process.env.BSC_RPC_URL);
const wallet = new ethers.Wallet(process.env.FAUCET_PRIVATE_KEY, provider);

// 3. Setup Kontrak MockUSDC (Minimal ABI - Anti Error!)
const MOCK_USDC_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function mint(address to, uint256 amount) external"
];
const usdcContract = new ethers.Contract(process.env.MOCK_USDC_ADDRESS, MOCK_USDC_ABI, wallet);

// Konfigurasi Jumlah Drip
const DRIP_BNB = ethers.parseEther(process.env.DRIP_AMOUNT_BNB || "0.1");
const DRIP_USDC = ethers.parseUnits(process.env.DRIP_AMOUNT_USDC || "1000", 6); // Asumsi 6 desimal

// Rate Limiting (In-Memory)
const claimHistory = new Map();
const COOLDOWN_MS = 60 * 60 * 1000; // 1 Jam

// Helper: Validasi Alamat
function isValidAddress(address) {
    try { ethers.getAddress(address); return true; } catch { return false; }
}

// ==========================================
// ENDPOINT 1: Info Saldo Faucet
// ==========================================
app.get('/api/info', async (req, res) => {
    try {
        const bnbBalance = await provider.getBalance(wallet.address);
        const usdcBalance = await usdcContract.balanceOf(wallet.address);
        
        res.json({
            success: true,
            wallet: wallet.address,
            bnbBalance: ethers.formatEther(bnbBalance),
            usdcBalance: ethers.formatUnits(usdcBalance, 6),
            network: "BNB Smart Chain Testnet (Chain ID: 97)"
        });
    } catch (error) {
        console.error("Info Error:", error);
        res.status(500).json({ success: false, error: "Gagal mengambil data" });
    }
});

// ==========================================
// ENDPOINT 2: Klaim BNB (Native Token)
// ==========================================
app.post('/api/claim-bnb', async (req, res) => {
    try {
        const { address } = req.body;
        if (!address || !isValidAddress(address)) return res.status(400).json({ success: false, error: "Alamat tidak valid" });
        
        const targetAddr = ethers.getAddress(address);
        const historyKey = targetAddr.toLowerCase() + '_bnb';
        
        // Cek Rate Limit
        const lastClaim = claimHistory.get(historyKey);
        if (lastClaim && (Date.now() - lastClaim < COOLDOWN_MS)) {
            return res.status(429).json({ success: false, error: "Tunggu 1 jam untuk klaim BNB lagi" });
        }

        // Cek Saldo
        const balance = await provider.getBalance(wallet.address);
        if (balance < DRIP_BNB) return res.status(503).json({ success: false, error: "Saldo BNB faucet habis!" });

        // Kirim BNB
        const tx = await wallet.sendTransaction({ to: targetAddr, value: DRIP_BNB });
        await tx.wait();

        claimHistory.set(historyKey, Date.now());

        res.json({
            success: true,
            message: `Berhasil mengirim ${ethers.formatEther(DRIP_BNB)} BNB!`,
            txHash: tx.hash,
            explorer: `https://testnet.bscscan.com/tx/${tx.hash}`
        });
    } catch (error) {
        console.error("BNB Error:", error);
        res.status(500).json({ success: false, error: "Transaksi BNB gagal" });
    }
});

// ==========================================
// ENDPOINT 3: Klaim MockUSDC (ERC20 Token)
// ==========================================
app.post('/api/claim-usdc', async (req, res) => {
    try {
        const { address } = req.body;
        if (!address || !isValidAddress(address)) return res.status(400).json({ success: false, error: "Alamat tidak valid" });
        
        const targetAddr = ethers.getAddress(address);
        const historyKey = targetAddr.toLowerCase() + '_usdc';
        
        // Cek Rate Limit
        const lastClaim = claimHistory.get(historyKey);
        if (lastClaim && (Date.now() - lastClaim < COOLDOWN_MS)) {
            return res.status(429).json({ success: false, error: "Tunggu 1 jam untuk klaim USDC lagi" });
        }

        // Mint USDC
        console.log(`💵 Minting ${process.env.DRIP_AMOUNT_USDC} MockUSDC ke ${targetAddr}...`);
        const tx = await usdcContract.mint(targetAddr, DRIP_USDC);
        await tx.wait();

        claimHistory.set(historyKey, Date.now());

        res.json({
            success: true,
            message: `Berhasil mengirim ${process.env.DRIP_AMOUNT_USDC} MockUSDC!`,
            txHash: tx.hash,
            explorer: `https://testnet.bscscan.com/tx/${tx.hash}`
        });
    } catch (error) {
        console.error("USDC Error:", error);
        // Error handling spesifik jika wallet bukan owner
        if (error.message && error.message.includes("caller is not the owner")) {
            return res.status(403).json({ success: false, error: "Wallet faucet tidak punya izin mint (bukan owner MockUSDC)." });
        }
        res.status(500).json({ success: false, error: "Transaksi USDC gagal" });
    }
});

// Jalankan Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n HOMR Faucet berjalan di http://localhost:${PORT}`);
    console.log(` Wallet: ${wallet.address}`);
    console.log(` Network: BNB Smart Chain Testnet\n`);
});