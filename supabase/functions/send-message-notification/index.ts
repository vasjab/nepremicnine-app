import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  recipientId: string;
  senderId: string;
  senderName: string;
  messagePreview: string;
  listingTitle: string;
  conversationId: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { recipientId, senderId, senderName, messagePreview, listingTitle, conversationId }: NotificationRequest = await req.json();

    console.log("Processing notification for recipient:", recipientId);

    // Check if recipient has email notifications enabled
    const { data: prefs } = await supabase
      .from("notification_preferences")
      .select("email_on_new_message")
      .eq("user_id", recipientId)
      .single();

    // Default to true if no preferences exist
    const emailEnabled = prefs?.email_on_new_message ?? true;

    if (!emailEnabled) {
      console.log("Email notifications disabled for user:", recipientId);
      return new Response(JSON.stringify({ sent: false, reason: "notifications_disabled" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Get recipient's email from auth.users
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(recipientId);

    if (userError || !userData?.user?.email) {
      console.error("Failed to get recipient email:", userError);
      return new Response(JSON.stringify({ sent: false, reason: "no_email" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const recipientEmail = userData.user.email;
    const truncatedPreview = messagePreview.length > 100 ? messagePreview.substring(0, 100) + "..." : messagePreview;

    console.log("Sending email to:", recipientEmail);

    const emailResponse = await resend.emails.send({
      from: "Rentals <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `New message from ${senderName || "Someone"} about "${listingTitle}"`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" max-width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">New Message</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      <p style="color: #71717a; font-size: 14px; margin: 0 0 8px 0;">You have a new message about:</p>
                      <h2 style="color: #18181b; font-size: 20px; margin: 0 0 24px 0; font-weight: 600;">${listingTitle}</h2>
                      
                      <!-- Message Preview -->
                      <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                        <p style="color: #3b82f6; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">${senderName || "Someone"}</p>
                        <p style="color: #3f3f46; font-size: 16px; margin: 0; line-height: 1.5;">"${truncatedPreview}"</p>
                      </div>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="https://nepremicnine-app.vercel.app/messages" 
                               style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                              View Conversation
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f4f4f5; padding: 24px; text-align: center;">
                      <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
                        You're receiving this because you have message notifications enabled.
                        <br>
                        Manage your preferences in your profile settings.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ sent: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-message-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
