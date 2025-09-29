import { Html, Head, Main, NextScript } from 'next/document'import { Html, Head, Main, NextScript } from 'next/document'

import Document, { DocumentContext, DocumentInitialProps } from 'next/document'import Document, { DocumentContext, DocumentInitialProps } from 'next/document'



class MyDocument extends Document {class MyDocument extends Document {

  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {

    const initialProps = await Document.getInitialProps(ctx)    const initialProps = await Document.getInitialProps(ctx)

    return initialProps    return initialProps

  }  }



  render() {  render() {

    return (    return (

      <Html lang="en">      <Html lang="en">

        <Head />        <Head />

        <body>        <body>

          <Main />          <Main />

          <NextScript />          <NextScript />

        </body>        </body>

      </Html>      </Html>

    )    )

  }  }

}}



export default MyDocumentexport default MyDocument
