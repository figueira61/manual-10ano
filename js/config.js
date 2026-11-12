globalThis.Manual = globalThis.Manual || {};

// Configuração pública do Supabase (projeto "manual-10ano", UE).
// A chave "anon" é pública por desenho: a proteção dos dados é feita pelas regras de acesso (RLS)
// definidas em supabase/migracoes/. Nunca colocar aqui a chave de serviço.
Manual.config = {
  supabaseUrl: 'https://dhflcwqwmhbyxqcsxvlh.supabase.co',
  supabaseChavePublica:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoZmxjd3F3bWhieXhxY3N4dmxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ1MTEzMjAsImV4cCI6MjExMDA4NzMyMH0.LjYsRF_GCTFnTJqGAWFC7mGwjgYU_M3jmSV0XPb-qtI',
};
