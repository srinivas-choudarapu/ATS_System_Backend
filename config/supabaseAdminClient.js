const { createClient } = require("@supabase/supabase-js");

const required = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missing = required.filter((k) => !process.env[k]);

if (missing.length) {
  throw new Error("Missing env vars: " + missing.join(", "));
}

const supabase1 = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabase1;