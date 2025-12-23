import '@styles/globals.css'
import Provider from '@components/Provider'
import Nav from '@components/Nav'

export const metadata = {
  title: 'RideMate',
  description: 'Your Ultimate Ride Sharing Companion',
}


const RootLayout = ({children}) => {
  return (
    <html lang='en'>
        <body>
          <div className='min-h-screen flex flex-col'>          
            <Provider>
              <Nav />
              <main className='app'>
                  {children}
              </main>
            </Provider>
          </div>
        </body>
    </html>
  )
}

export default RootLayout