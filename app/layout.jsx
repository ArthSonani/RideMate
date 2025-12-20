import '@styles/globals.css'
import { Children } from 'react'

export const metadata = {
  title: 'RideMate',
  description: 'Your Ultimate Ride Sharing Companion',
}


const RootLayout = ({children}) => {
  return (
    <html lang='en'>
        <body>
            <main className='app'>
                {children}
            </main>
        </body>
    </html>
  )
}

export default RootLayout