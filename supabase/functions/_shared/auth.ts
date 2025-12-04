import { createClient, SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2'

export const validateUser = async (req: Request): Promise<{ user: User | null; supabase: SupabaseClient; error?: Response }> => {
    try {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return {
                user: null,
                supabase: null as any,
                error: new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401 })
            }
        }

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        const {
            data: { user },
            error,
        } = await supabaseClient.auth.getUser()

        if (error || !user) {
            return {
                user: null,
                supabase: supabaseClient,
                error: new Response(JSON.stringify({ error: 'Invalid token', details: error }), { status: 401 })
            }
        }

        return { user, supabase: supabaseClient }
    } catch (err) {
        return {
            user: null,
            supabase: null as any,
            error: new Response(JSON.stringify({ error: 'Internal Server Error', details: err }), { status: 500 })
        }
    }
}
