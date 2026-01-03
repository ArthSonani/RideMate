import Link from 'next/link'
import Image from 'next/image'

const Home = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <section className="flex flex-center relative pt-6 pb-6 sm:pt-32 sm:pb-40 bg-[linear-gradient(to_right,rgba(0,0,0,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.15)_1px,transparent_1px)] [background-size:45px_45px]">
        <div className="flex justify-center items-center w-auto px-2 sm:px-2 lg:px-20">
          <div className="text-left">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block my-2">Share the Ride.</span>
              <span className="block my-2">Split the Cost.</span>
              <span className="block my-2">Travel Smarter.</span>
            </h1>
            <p className="mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:text-lg md:max-w-xl">
              Connect with people who are heading in the same direction as you,
              Split travel costs, reduce fuel consumption,
              and turn ordinary rides into smarter, shared journeys.
            </p>
            <div className="mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
              <div className="rounded-md shadow">
                <Link href="/rides" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#984764] hover:bg-[#BD5A7C] md:py-4 md:text-lg md:px-10 transition-colors">
                  Find a Ride
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
              <div className="mt-3 rounded-md sm:mt-0 sm:ml-3">
                <Link href="/rides/create" className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-gray-800 bg-[#F0E5E9] hover:shadow hover:text-gray-600 md:py-4 md:text-lg md:px-10 transition-colors">
                  Offer a Ride
                  <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className='flex justify-center items-center w-2/3 h-full'>
            <img
              src="/hero.png"
              alt="RideMate Hero"
              width={650}
              height={650}
              className="object-cover object-center rounded-lg p-2"
            />
        </div>
  
      </section>

      <section className="py-16 bg-[#F0E5E9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-[#984764] font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for ride sharing
            </p>
            <p className="mt-4 max-w-2xl text-md text-gray-500 lg:mx-auto">
              RideMate provides all the features you need to find, share, and manage your rides efficiently.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-neutral-300 text-white mx-auto">
                  <Image className="h-6 w-6" src="/connect.png" width={24} height={24} alt="Connection Icon" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Connect with Riders</h3>
                <p className="mt-2 text-base text-gray-500">
                  Find and connect with verified riders heading in your direction. Build your trusted network.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-neutral-300 text-white mx-auto">
                  <Image className="h-6 w-6" src="/secure.png" width={24} height={24} alt="secure Icon" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Safe & Secure</h3>
                <p className="mt-2 text-base text-gray-500">
                  All users are verified and rides are tracked for your safety and peace of mind.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-neutral-300 text-white mx-auto">
                  <Image className="h-6 w-6" src="/save-time.png" width={24} height={24} alt="Save Time Icon" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Save Time & Money</h3>
                <p className="mt-2 text-base text-gray-500">
                  Reduce travel costs and time by sharing rides with others going the same way.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-neutral-300 text-white mx-auto">
                  <Image className="h-6 w-6" src="/map.png" width={24} height={24} alt="map Icon" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Visualize Your Route</h3>
                <p className="mt-2 text-base text-gray-500">
                  Instantly view the complete route between source and destination before choosing a ride.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-neutral-300 text-white mx-auto">
                  <Image className="h-6 w-6" src="/options.png" width={24} height={24} alt="Flexible Options Icon" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Flexible Options</h3>
                <p className="mt-2 text-base text-gray-500">
                  Offer rides as a driver, owner or find rides as a passenger. Choose what works for you.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-neutral-300 text-white mx-auto">
                  <Image className="h-6 w-6" src="/bio.png" width={24} height={24} alt="Eco-Friendly Icon" />              
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Eco-Friendly</h3>
                <p className="mt-2 text-base text-gray-500">
                  Reduce your carbon footprint by sharing rides and contributing to a cleaner environment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#984764]">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to start sharing rides?</span>
            <span className="block">Join RideMate today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-neutral-400">
            Create your account and start connecting with riders in your area.
          </p>
          <Link href="/register" className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white hover:bg-neutral-300 sm:w-auto transition-colors">
            Get Started Free
            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
