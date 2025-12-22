"use client";
import { sendError } from '@node_modules/next/dist/server/api-utils';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const Dashboard = () => {
  const { data: session } = useSession();

  console.log(session);

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
    </div>
  );
}

export default Dashboard