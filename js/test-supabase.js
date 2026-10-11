
import { supabase } from "./supabase-client.js";

async function testConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Supabase error:", error.message);
      return;
    }

    console.log("Supabase client initialized successfully!");
    console.log("Session exists:", Boolean(data.session));
  } catch (err) {
    console.error("Connection test failed:", err.message);
  }
}

testConnection();
