import type { AppProps } from 'next/app'import type { AppProps } from 'next/app'

  

export default function App({ Component, pageProps }: AppProps) {export default function App({ Component, pageProps }: AppProps) {

  return <Component {...pageProps} />  return <Component {...pageProps} />

}}
