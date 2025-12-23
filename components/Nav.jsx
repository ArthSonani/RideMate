"use client";

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'


const Nav = () => {
  const { data: session } = useSession()


  return (
    <nav className="bg-white backdrop-blur-md shadow-lg sticky top-0 z-50 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex flex-row justify-around items-center">
              <Image
                src="/ridemate-main.png"
                width={45}
                height={45}
                alt="logo"
              />
              <div className="ml-2 text-2xl font-bold text-gray-800">RideMate</div>
            </Link>
            <div className="flex items-center space-x-4">
              {!session ? (
                <>
                  <Link href="/login" className="bg-gray-100 text-gray-700 hover:bg-neutral-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Sign In
                  </Link>
                  <Link href="/register" className="bg-[#984764] hover:bg-[#BD5A7C] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard" className="bg-gray-100 text-gray-700 hover:bg-neutral-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="bg-[#984764] hover:bg-[#BD5A7C] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

  )
}

export default Nav