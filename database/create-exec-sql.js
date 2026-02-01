import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dndpcnyiqrtjfefpnqho.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuZHBjbnlpcXJ0amZlZnBucWhvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkwMzk2NiwiZXhwIjoyMDg1NDc5OTY2fQ.mofDazpwvPNPVWgVzJqdItAFCwuZ61DemXNk6wsR0T0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createExecSqlFunction() {
  console.log('Creating exec_sql function...');
  
  // Create the exec_sql function using raw REST API
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseServiceKey}`,
      'apikey': supabaseServiceKey
    },
    body: JSON.stringify({
      sql: `CREATE OR REPLACE FUNCTION exec_sql(query text) RETURNS json AS $$
        DECLARE
          result json;
        BEGIN
          EXECUTE query;
          result := '{"success": true}'::json;
          RETURN result;
        EXCEPTION WHEN OTHERS THEN
          result := json_build_object('error', SQLERRM);
          RETURN result;
        END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;`
    })
  });
  
  if (!response.ok) {
    console.log('Function might not exist yet, trying direct SQL via REST...');
    
    // Try direct SQL endpoint
    const sqlResponse = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'apikey': supabaseServiceKey,
        'Prefer': 'params=single-object'
      },
      body: JSON.stringify({
        query: `CREATE OR REPLACE FUNCTION exec_sql(query text) RETURNS json AS $$
          DECLARE
            result json;
          BEGIN
            EXECUTE query;
            result := '{"success": true}'::json;
            RETURN result;
          EXCEPTION WHEN OTHERS THEN
            result := json_build_object('error', SQLERRM);
            RETURN result;
          END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;`
      })
    });
    
    console.log('Response status:', sqlResponse.status);
    const text = await sqlResponse.text();
    console.log('Response:', text);
  } else {
    const result = await response.json();
    console.log('Function created:', result);
  }
}

createExecSqlFunction();
