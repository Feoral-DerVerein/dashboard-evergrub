export interface UnifiedProduct {
    id: string;
    name: string;
    sku?: string;
    price: number;
    stockLevel?: number;
    category?: string;
}

export interface UnifiedTransaction {
    id: string;
    date: Date;
    totalAmount: number;
    currency: string;
    items: UnifiedTransactionItem[];
}

export interface UnifiedTransactionItem {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    merchantId?: string; // Provider specific merchant/tenant ID if available
}

export interface NotificationEvent {
    type: 'inventory_update' | 'transaction_created';
    payload: any;
}

export interface POSProvider {
    /**
     * Generates the authorization URL for the OAuth flow.
     * @param state Unique state string for CSRF protection
     */
    getAuthUrl(state: string): string;

    /**
     * Exchanges the temporary authorization code for access tokens.
     */
    exchangeCode(code: string): Promise<AuthTokens>;

    /**
     * Fetches the product catalog.
     */
    getProducts(accessToken: string): Promise<UnifiedProduct[]>;

    /**
     * Fetches transactions within a date range.
     */
    getTransactions(accessToken: string, fromDate: Date, toDate?: Date): Promise<UnifiedTransaction[]>;

    /**
     * (Optional) Validates and normalizes an incoming webhook payload.
     */
    normalizeWebhook?(payload: any, signature?: string): NotificationEvent | null;
}
