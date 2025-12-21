import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Here you would typically:
    // 1. Check if user exists in database
    // 2. Verify password (compare with hashed password)
    // 3. Generate JWT token
    // 4. Set authentication cookie/session
    
    // For now, we'll simulate a successful login
    // In production, replace this with actual database authentication
    const user = {
      id: '1',
      email: email,
      name: 'Demo User'
    }

    return NextResponse.json(
      { 
        message: 'Login successful',
        user: user,
        token: 'demo-jwt-token' // In production, use real JWT
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
