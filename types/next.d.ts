import { NextPage } from 'next';
import { AppProps } from 'next/app';
import { ReactElement, ReactNode } from 'react';

declare module 'next' {
  export type PageProps = {
    params?: Record<string, string | string[]>;
    searchParams?: Record<string, string | string[]>;
  };

  export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
    getLayout?: (page: ReactElement) => ReactNode;
  };
}
