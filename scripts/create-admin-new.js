import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://rqvymrvqtkdzkeoaynfr.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdnltcnZxdGtkemtlb2F5bmZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQwNTU4NiwiZXhwIjoyMDcwOTgxNTg2fQ.NvKQC6LcnOQkA6r6PODUVJLwTtwFSGvputkZrLn27DE'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    // Step 1: Create the user with admin role
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email: 'jadesola0518@gmail.com',
      password: 'Amoke1805',
      options: {
        data: {
          full_name: 'Admin User',
          role: 'ADMIN'
        }
      }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return
    }

    if (!user) {
      console.error('No user was created')
      return
    }

    // Step 2: Update the user's role to admin
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { role: 'service_role' }
    )

    if (updateError) {
      console.error('Error updating user role:', updateError)
      return
    }

    console.log('Admin user created successfully:', {
      id: user.id,
      email: user.email,
      role: 'ADMIN'
    })
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the function
createAdminUser()
