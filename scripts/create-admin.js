import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rqvymrvqtkdzkeoaynfr.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdnltcnZxdGtkemtlb2F5bmZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQwNTU4NiwiZXhwIjoyMDcwOTgxNTg2fQ.NvKQC6LcnOQkA6r6PODUVJLwTtwFSGvputkZrLn27DE'

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    // Step 1: Create the user
    const { data, error } = await supabaseAdmin.auth.signUp({
      email: 'jadesola0518@gmail.com',
      password: 'Amoke1805',
      options: {
        data: {
          full_name: 'Admin User',
          role: 'ADMIN'
        }
      }
    })
      email: 'jadesola0518@gmail.com',
      password: 'Amoke1805',
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin User',
        role: 'ADMIN'
      }
    })

    if (createError) {
      console.error('Error creating admin user:', createError.message)
      return
    }

    if (!userData?.user?.id) {
      console.error('No user ID returned')
      return
    }

    // Update the user's role in the auth.users table
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userData.user.id,
      { role: 'ADMIN' }
    )

    if (updateError) {
      console.error('Error updating user role:', updateError.message)
      return
    }

    console.log('Admin user created and configured successfully:', {
      id: userData.user.id,
      email: userData.user.email,
      role: 'ADMIN'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the function
createAdminUser()
