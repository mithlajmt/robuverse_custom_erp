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

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminUsers = [
    { email: "mithlajmatta@gmail.com", password: "test@123", name: "Mithlaj Matta" },
    { email: "nihal1abs@gmail.com", password: "test@123", name: "Nihal Labs" }
  ];

  for (const userConfig of adminUsers) {
    const { email, password, name } = userConfig;
    console.log(`Setting up user ${email} in Supabase Auth...`);

    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      console.error("Error listing users:", listError.message);
    }

    let userId: string | null = null;
    const existingUser = usersData?.users.find((u) => u.email === email);

    if (existingUser) {
      userId = existingUser.id;
      console.log(`Updating password for existing user: ${email} (ID: ${userId})`);
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
      });
      if (updateError) {
        console.error("Error updating user:", updateError.message);
      } else {
        console.log(`✅ Successfully updated password for ${email}!`);
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
        userId = newUser.user.id;
        console.log(`✅ Successfully created user ${email} (ID: ${userId})!`);
      }
    }

    if (userId) {
      console.log(`Upserting Prisma Profile for ${email}...`);
      await prisma.profile.upsert({
        where: { email },
        update: { fullName: name, role: "admin" },
        create: {
          id: userId,
          email,
          fullName: name,
          role: "admin"
        }
      });
      console.log(`✅ Prisma Profile synced for ${email}!`);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
