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
          <Provider>
            <Nav />
            <main className='app'>
                {children}
            </main>
          </Provider>
        </body>
    </html>
  )
}

export default RootLayout