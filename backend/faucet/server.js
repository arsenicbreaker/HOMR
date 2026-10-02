import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Local Vite ports may change; deployed origins must be listed explicitly.
const allowedOrigins = (process.env.FAUCET_ALLOWED_ORIGINS || '').split(',').map((origin) => origin.trim()).filter(Boolean);
const isLocalOrigin = (origin) => /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (!isLocalOrigin(origin) && !allowedOrigins.includes(origin)) {
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

// MockUSDC reads and mint operation.
const MOCK_USDC_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function mint(address to, uint256 amount) external"
];
const usdcContract = new ethers.Contract(process.env.MOCK_USDC_ADDRESS, MOCK_USDC_ABI, wallet);

// Konfigurasi Jumlah Drip
const DRIP_BNB_AMOUNT = process.env.DRIP_AMOUNT_BNB || '0.1';
const DRIP_USDC_AMOUNT = process.env.DRIP_AMOUNT_USDC || '1000';
const DRIP_BNB = ethers.parseEther(DRIP_BNB_AMOUNT);
let decimalsRequest;
function getTokenDecimals() {
    if (!decimalsRequest) {
        decimalsRequest = usdcContract.decimals().then(Number).catch((error) => {
            decimalsRequest = undefined;
            throw error;
        });
    }
    return decimalsRequest;
}

async function ensureTestnet() {
    const network = await provider.getNetwork();
    if (network.chainId !== 97n) throw new Error('Faucet RPC must use BNB Chain Testnet (97).');
}

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
        await ensureTestnet();
        const bnbBalance = await provider.getBalance(wallet.address);
        const usdcBalance = await usdcContract.balanceOf(wallet.address);
        const tokenDecimals = await getTokenDecimals();
        
        res.json({
            success: true,
            wallet: wallet.address,
            bnbBalance: ethers.formatEther(bnbBalance),
            usdcBalance: ethers.formatUnits(usdcBalance, tokenDecimals),
            dripBnb: DRIP_BNB_AMOUNT,
            dripUsdc: DRIP_USDC_AMOUNT,
            cooldownSeconds: COOLDOWN_MS / 1000,
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
        await ensureTestnet();
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
        await ensureTestnet();
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
        const tokenDecimals = await getTokenDecimals();
        const dripUsdc = ethers.parseUnits(DRIP_USDC_AMOUNT, tokenDecimals);
        console.log(`💵 Minting ${DRIP_USDC_AMOUNT} MockUSDC ke ${targetAddr}...`);
        const tx = await usdcContract.mint(targetAddr, dripUsdc);
        await tx.wait();

        claimHistory.set(historyKey, Date.now());

        res.json({
            success: true,
            message: `Berhasil mengirim ${DRIP_USDC_AMOUNT} MockUSDC!`,
            txHash: tx.hash,
            explorer: `https://testnet.bscscan.com/tx/${tx.hash}`
        });
    } catch (error) {
        console.error("USDC Error:", error);
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
