import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  const email = process.env.DEFAULT_ADMIN_EMAIL || "mithlajmatta@gmail.com";
  const password = "test@123";

  console.log(`Setting up user ${email} in Supabase Auth...`);

  const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Error listing users:", listError.message);
  }

  const existingUser = usersData?.users.find((u) => u.email === email);

  if (existingUser) {
    console.log(`Updating password for existing user: ${email}`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
    });
    if (updateError) {
      console.error("Error updating user:", updateError.message);
    } else {
      console.log(`✅ Successfully updated password for ${email} to '${password}'!`);
    }
  } else {
    console.log(`Creating new user: ${email}`);
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) {
      console.error("Error creating user:", createError.message);
    } else {
      console.log(`✅ Successfully created user ${email} with password '${password}'!`);
    }
  }
}

main();
