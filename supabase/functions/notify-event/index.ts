import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const resendApiKey = Deno.env.get('RESEND_API_KEY');
const expoAccessToken = Deno.env.get('EXPO_ACCESS_TOKEN');

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase credentials for notify-event function.');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type NotificationType = 'chat' | 'leads' | 'proposals' | string;

interface NotifyEventBody {
  recipientId: string;
  title: string;
  body: string;
  type?: NotificationType;
  data?: Record<string, unknown>;
}

const DEFAULT_PREFERENCES = {
  chat: true,
  leads: true,
  proposals: true,
};

const shouldSendNotification = (prefs: Record<string, unknown> | null, type: NotificationType) => {
  const merged = { ...DEFAULT_PREFERENCES, ...(prefs ?? {}) };

  switch (type) {
    case 'chat':
      return merged.chat !== false;
    case 'leads':
      return merged.leads !== false;
    case 'proposals':
      return merged.proposals !== false;
    default:
      return true;
  }
};

const sendPushNotifications = async (tokens: string[], title: string, message: string, data: Record<string, unknown>) => {
  if (tokens.length === 0) return;

  const chunks: string[][] = [];
  for (let i = 0; i < tokens.length; i += 99) {
    chunks.push(tokens.slice(i, i + 99));
  }

  await Promise.all(
    chunks.map(async (chunk) => {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(expoAccessToken ? { Authorization: `Bearer ${expoAccessToken}` } : {}),
        },
        body: JSON.stringify(
          chunk.map((token) => ({
            to: token,
            sound: 'default',
            title,
            body: message,
            data,
          })),
        ),
      });

      if (!response.ok) {
        console.error('Expo push response', await response.text());
      }
    }),
  );
};

const sendEmailNotification = async (email: string, subject: string, message: string) => {
  if (!resendApiKey) return;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: 'Elastiquality <notifications@elastiquality.pt>',
      to: [email],
      subject,
      html: `<p>${message}</p>`,
    }),
  });

  if (!response.ok) {
    console.error('Resend error', await response.text());
  }
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const jwt = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(jwt);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as NotifyEventBody;
    const { recipientId, title, body: messageBody, type = 'generic', data = {} } = body;

    if (!recipientId || !title || !messageBody) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: recipient, error: recipientError } = await supabaseAdmin
      .from('users')
      .select('email, name, notification_preferences')
      .eq('id', recipientId)
      .maybeSingle();

    if (recipientError) throw recipientError;
    if (!recipient?.email) {
      return new Response(JSON.stringify({ error: 'Recipient not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!shouldSendNotification(recipient.notification_preferences as Record<string, unknown> | null, type)) {
      return new Response(JSON.stringify({ skipped: true, reason: 'Preference disabled' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const notificationBody = messageBody.length > 180 ? `${messageBody.slice(0, 180)}…` : messageBody;

    await supabaseAdmin.from('notifications').insert({
      user_id: recipientId,
      type,
      title,
      body: notificationBody,
      data,
    });

    const { data: tokensData, error: tokensError } = await supabaseAdmin
      .from('device_tokens')
      .select('token')
      .eq('user_id', recipientId);

    if (tokensError) throw tokensError;

    const tokens = (tokensData || []).map((row: { token: string }) => row.token);

    await Promise.all([
      sendPushNotifications(tokens, title, notificationBody, { ...data, type }),
      sendEmailNotification(recipient.email, title, notificationBody),
    ]);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('notify-event error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


