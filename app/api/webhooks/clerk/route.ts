import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { createUser, updateUser, deleteUser } from '@/lib/db/user'

// Webhook event types from Clerk
interface ClerkWebhookEvent {
  type: string
  data: {
    id: string
    email_addresses: Array<{
      email_address: string
      id: string
    }>
    first_name?: string
    last_name?: string
    username?: string
    image_url?: string
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify the webhook signature
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
    
    if (!WEBHOOK_SECRET) {
      throw new Error('CLERK_WEBHOOK_SECRET is not set')
    }

    // Get the headers
    const headerPayload = headers()
    const svix_id = headerPayload.get('svix-id')
    const svix_timestamp = headerPayload.get('svix-timestamp')
    const svix_signature = headerPayload.get('svix-signature')

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new NextResponse('Error occured -- no svix headers', {
        status: 400,
      })
    }

    // Get the body
    const payload = await req.json()
    const body = JSON.stringify(payload)

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET)

    let evt: ClerkWebhookEvent

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as ClerkWebhookEvent
    } catch (err) {
      console.error('Error verifying webhook:', err)
      return new NextResponse('Error occured', {
        status: 400,
      })
    }

    // Handle the webhook
    const { type, data } = evt

    console.log(`Webhook with an ID of ${data.id} and type of ${type}`)

    try {
      switch (type) {
        case 'user.created':
          await handleUserCreated(data)
          break
        case 'user.updated':
          await handleUserUpdated(data)
          break
        case 'user.deleted':
          await handleUserDeleted(data)
          break
        default:
          console.log(`Unhandled webhook type: ${type}`)
      }

      return new NextResponse('Success', { status: 200 })
    } catch (error) {
      console.error(`Error handling webhook ${type}:`, error)
      return new NextResponse('Internal Server Error', { status: 500 })
    }
  } catch (error) {
    console.error('Webhook processing error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

async function handleUserCreated(data: ClerkWebhookEvent['data']) {
  try {
    const primaryEmail = data.email_addresses.find(email => email.id === data.email_addresses[0]?.id)
    
    if (!primaryEmail) {
      throw new Error('No primary email found for user')
    }

    await createUser({
      clerkId: data.id,
      email: primaryEmail.email_address,
      firstName: data.first_name || null,
      lastName: data.last_name || null,
      username: data.username || null,
      imageUrl: data.image_url || null,
    })

    console.log(`User created successfully: ${data.id}`)
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

async function handleUserUpdated(data: ClerkWebhookEvent['data']) {
  try {
    const primaryEmail = data.email_addresses.find(email => email.id === data.email_addresses[0]?.id)
    
    if (!primaryEmail) {
      throw new Error('No primary email found for user')
    }

    await updateUser(data.id, {
      email: primaryEmail.email_address,
      firstName: data.first_name || null,
      lastName: data.last_name || null,
      username: data.username || null,
      imageUrl: data.image_url || null,
    })

    console.log(`User updated successfully: ${data.id}`)
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

async function handleUserDeleted(data: ClerkWebhookEvent['data']) {
  try {
    await deleteUser(data.id)
    console.log(`User deleted successfully: ${data.id}`)
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

// Allow all HTTP methods for webhook endpoint
export const GET = POST
export const PUT = POST
export const PATCH = POST
export const DELETE = POST 