
export const sendEmail = async (to: string[], subject: string, html: string) => {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    // Fallback if no key (for dev/demo)
    if (!RESEND_API_KEY) {
        console.log("[Mock Mailer] Would send email to:", to);
        console.log("[Mock Mailer] Subject:", subject);
        // console.log("[Mock Mailer] Body:", html);
        return { success: true, mocked: true };
    }

    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: "Aladdin Alerts <onboarding@resend.dev>", // Default Resend sender
                to,
                subject,
                html,
            }),
        });

        const data = await res.json();

        if (!res.ok) {
            console.error("Resend Error:", data);
            return { success: false, error: data };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Mailer Error:", error);
        return { success: false, error };
    }
};
