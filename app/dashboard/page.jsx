"use client";
import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';

const Dashboard = () => {
  const { data: session } = useSession();

  return (
    <div>
      <p>Dashboard</p>
      <p>{session?.user?.email}</p>
      <p>{session?.user?.name}</p>
      <p>{session?.user?.phone}</p>
      <img
        src={session?.user?.image || '/ridemate2.png'}
        alt='User Avatar'
        width={100}
        height={100}
      />
      {session && (
        <div style={{ marginTop: 16 }}>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-4 py-2 rounded bg-gray-900 text-white"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard