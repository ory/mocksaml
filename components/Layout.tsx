import Head from 'next/head';
import type { ReactNode } from 'react';
import Header from './Header';

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const title = 'Mock SAML - A free SAML 2.0 Identity Provider for testing SAML SSO integrations.';
  const description = 'A free SAML 2.0 Identity Provider for testing SAML SSO integrations.';
  const website = 'https://mocksaml.com';
  const ogImage = `${website}/mock-saml-preview-image.png`;

  return (
    <>
      <Head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <title>{title}</title>
        <meta name='description' content={description} />
        <meta name='author' content='BoxyHQ' />

        <meta property='og:url' content={website} />
        <meta property='og:type' content='website' />
        <meta property='og:title' content={title} />
        <meta property='og:description' content={description} />
        <meta property='og:image' content={ogImage} />

        <meta name='twitter:card' content='summary_large_image' />
        <meta property='twitter:domain' content='mocksaml.com' />
        <meta property='twitter:url' content={website} />
        <meta name='twitter:title' content={title} />
        <meta name='twitter:description' content={description} />
        <meta name='twitter:image' content={ogImage} />
      </Head>
      <Header />
      <main className='h-[calc(100%-80px)] overflow-auto py-5'>{children}</main>
    </>
  );
}
