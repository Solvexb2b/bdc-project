import { Router } from "express";
import { db } from "@workspace/db";
import { ordersTable, paradoxProductsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";

const router = Router();

const CRYPTO_ADDRESSES = {
  eth: process.env.ETH_WALLET_ADDRESS ?? "",
  usdc: process.env.USDC_WALLET_ADDRESS ?? process.env.ETH_WALLET_ADDRESS ?? "",
  btc: process.env.BTC_WALLET_ADDRESS ?? "",
};

const CRYPTO_RATES: Record<string, number> = {
  eth: parseFloat(process.env.ETH_PRICE_USD ?? "3500"),
  usdc: 1,
  btc: parseFloat(process.env.BTC_PRICE_USD ?? "65000"),
};

function usdToCrypto(usd: number, currency: string): string {
  const rate = CRYPTO_RATES[currency] ?? 1;
  const amount = usd / rate;
  return currency === "usdc"
    ? amount.toFixed(2)
    : currency === "btc"
      ? amount.toFixed(8)
      : amount.toFixed(6);
}

router.post("/crypto/payment-intent", async (req: any, res) => {
  try {
    const { productId, currency } = req.body;
    if (!productId || !currency) { res.status(400).json({ error: "productId and currency required" }); return; }

    const curr = (currency as string).toLowerCase();
    if (!["eth", "usdc", "btc"].includes(curr)) {
      res.status(400).json({ error: "currency must be eth, usdc, or btc" }); return;
    }

    const walletAddress = CRYPTO_ADDRESSES[curr as keyof typeof CRYPTO_ADDRESSES];
    if (!walletAddress) {
      res.status(503).json({
        error: `${curr.toUpperCase()} wallet not configured`,
        hint: `Set ${curr.toUpperCase()}_WALLET_ADDRESS in environment secrets`,
      }); return;
    }

    const [product] = await db.select().from(paradoxProductsTable).where(eq(paradoxProductsTable.id, productId));
    if (!product) { res.status(404).json({ error: "Product not found" }); return; }

    const usdAmount = parseFloat(product.priceUsdc);
    const cryptoAmount = curr === "eth"
      ? product.priceEth
      : curr === "btc"
        ? product.priceBtc
        : product.priceUsdc;
    const userId = (req.session as any)?.userId ?? "1";
    const orderId = nanoid();

    await db.insert(ordersTable).values({
      id: orderId,
      userId,
      productId,
      status: "awaiting_payment",
      paymentMethod: curr,
      amount: cryptoAmount,
      walletAddress,
    });

    res.json({
      orderId,
      currency: curr.toUpperCase(),
      amount: cryptoAmount,
      walletAddress,
      productName: product.name,
      usdEquivalent: usdAmount,
      instructions: [
        `Send exactly ${cryptoAmount} ${curr.toUpperCase()} to the address above`,
        "Include your Order ID in the transaction memo if supported",
        "Payment is typically confirmed within 1-3 network confirmations",
        "Your license will be delivered once payment is verified",
      ],
      rateNote: curr === "usdc" ? "1:1 USD peg" : `Rate used: 1 ${curr.toUpperCase()} = $${CRYPTO_RATES[curr].toLocaleString()} USD`,
    });
  } catch (err: any) {
    req.log.error({ err }, "Crypto payment intent error");
    res.status(500).json({ error: err.message });
  }
});

router.post("/crypto/verify/:orderId", async (req: any, res) => {
  try {
    const { txHash } = req.body;
    const { orderId } = req.params;

    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId));
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }

    await db
      .update(ordersTable)
      .set({
        transactionHash: txHash,
        status: "payment_submitted",
        confirmedAt: new Date(),
      })
      .where(eq(ordersTable.id, orderId));

    res.json({
      orderId,
      status: "payment_submitted",
      txHash,
      message: "Transaction hash recorded. Owner will verify and release your license.",
    });
  } catch (err: any) {
    req.log.error({ err }, "Crypto verify error");
    res.status(500).json({ error: err.message });
  }
});

router.get("/crypto/order/:orderId", async (req: any, res) => {
  try {
    const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, req.params.orderId));
    if (!order) { res.status(404).json({ error: "Order not found" }); return; }
    res.json(order);
  } catch (err: any) {
    req.log.error({ err }, "Crypto order lookup error");
    res.status(500).json({ error: err.message });
  }
});

router.get("/crypto/addresses", (_req: any, res) => {
  res.json({
    eth: CRYPTO_ADDRESSES.eth || null,
    usdc: CRYPTO_ADDRESSES.usdc || null,
    btc: CRYPTO_ADDRESSES.btc || null,
    configured: {
      eth: !!CRYPTO_ADDRESSES.eth,
      usdc: !!CRYPTO_ADDRESSES.usdc,
      btc: !!CRYPTO_ADDRESSES.btc,
    },
  });
});

export default router;
