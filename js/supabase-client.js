
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://ipxxfzuviwscxzxnbcvo.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_oYiU_ACfPmy7xQQ2J9YJnw_Gb3qey10";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
