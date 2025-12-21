import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { name, email, password, phone } = await request.json()

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      )
    }

    // Validate name
    if (typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { message: 'Name must be a non-empty string' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Convert email to lowercase as per schema
    const normalizedEmail = email.toLowerCase()

    // Validate password length (basic requirement)
    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Validate phone if provided
    if (phone && typeof phone !== 'string') {
      return NextResponse.json(
        { message: 'Phone must be a string' },
        { status: 400 }
      )
    }

    // Here you would typically:
    // 1. Check if email already exists in database
    // 2. Hash the password
    // 3. Save user to database
    // 4. Generate JWT token
    // 5. Return success response
    
    // For now, we'll simulate a successful registration
    // In production, replace this with actual database operations
    const user = {
      id: '1',
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : null,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json(
      { 
        message: 'Registration successful',
        user: user,
        token: 'demo-jwt-token' // In production, use real JWT
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
