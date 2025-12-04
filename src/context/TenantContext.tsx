import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface TenantContextType {
    tenantId: string | null;
    loading: boolean;
}

const TenantContext = createContext<TenantContextType>({ tenantId: null, loading: true });

export const useTenant = () => useContext(TenantContext);

export const TenantProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, loading: authLoading } = useAuth();
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (user) {
            // Phase 1: Simple Multi-Tenancy
            // We assume the User ID is the Tenant ID for now (Single User Tenant)
            // In Phase 2, we will fetch this from a 'tenants' table or 'profiles.tenant_id'
            setTenantId(user.id);
        } else {
            setTenantId(null);
        }
        setLoading(false);
    }, [user, authLoading]);

    return (
        <TenantContext.Provider value={{ tenantId, loading }}>
            {children}
        </TenantContext.Provider>
    );
};
