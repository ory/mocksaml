import { GetServerSideProps } from 'next';
import Link from 'next/link';
import React from 'react';
import config from '../lib/env';
import { IdPMetadata } from '../types';
import { getEntityId, getSSOUrl } from 'lib/entity-id';

const Home: React.FC<{ metadata: IdPMetadata; params: any }> = ({ metadata, params }) => {
  const namespace = params.namespace;

  const { ssoUrl: appUrl, entityId, certificate } = metadata;
  const namespaceEntityId = getEntityId(entityId, namespace);

  const metadataDownloadUrl =
    '/api' + (namespace ? `/namespace/${namespace}` : '') + '/saml/metadata?download=true';
  const metadataUrl = '/api' + (namespace ? `/namespace/${namespace}` : '') + '/saml/metadata';
  const loginUrl = (namespace ? `/namespace/${namespace}` : '') + '/saml/login';
  const ssoUrl = getSSOUrl(appUrl, namespace);

  return (
    <div className='flex min-h-screen justify-center bg-white pt-12'>
      <div className='w-full max-w-4xl px-2 space-y-6'>
        <h1 className='text-center text-xl font-semibold text-gray-900 md:text-2xl'>
          A free SAML 2.0 Identity Provider for testing SAML SSO integrations.
        </h1>

        {/* Actions */}
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='flex flex-col gap-3 md:flex-row'>
            <Link
              href={metadataDownloadUrl}
              className='inline-flex items-center justify-center rounded-md
                         bg-primary px-4 py-2 text-sm font-semibold text-white
                         hover:bg-primary/90 focus:outline-none
                         focus:ring-2 focus:ring-primary/40'>
              <svg
                className='mr-2 h-5 w-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                strokeWidth='2'
                aria-hidden>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                />
              </svg>
              Download Metadata
            </Link>

            <Link
              href={metadataUrl}
              target='_blank'
              className='inline-flex items-center justify-center rounded-md
                         border border-primary px-4 py-2 text-sm font-semibold
                         text-primary hover:bg-primary/10
                         focus:outline-none focus:ring-2 focus:ring-primary/40'>
              Metadata URL
            </Link>
          </div>

          <Link
            href={loginUrl}
            className='inline-flex items-center justify-center rounded-md
                       border border-primary px-4 py-2 text-sm font-semibold
                       text-primary hover:bg-primary/10
                       focus:outline-none focus:ring-2 focus:ring-primary/40'>
            Test IdP Login
          </Link>
        </div>

        {/* Metadata Card */}
        <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
          <h2 className='mb-5 text-center text-2xl font-semibold text-gray-900'>Mock SAML Metadata</h2>

          <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>SSO URL</label>
              <input
                type='text'
                defaultValue={ssoUrl}
                disabled
                className='w-full rounded-md border border-gray-300
                           bg-gray-100 px-3 py-2 text-sm text-gray-700'
              />
            </div>

            <div>
              <label className='mb-1 block text-sm font-medium text-gray-700'>Entity ID</label>
              <input
                type='text'
                defaultValue={namespaceEntityId}
                disabled
                className='w-full rounded-md border border-gray-300
                           bg-gray-100 px-3 py-2 text-sm text-gray-700'
              />
            </div>

            <div className='md:col-span-2'>
              <label className='mb-1 block text-sm font-medium text-gray-700'>Certificate</label>
              <textarea
                defaultValue={certificate}
                disabled
                className='h-48 w-full rounded-md border border-gray-300
                           bg-gray-100 px-3 py-2 text-sm font-mono text-gray-700'
              />
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className='rounded-md border border-red-200 bg-red-50 p-4'>
          <p className='text-sm font-medium text-red-900'>Caution: Not for production use.</p>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const metadata: IdPMetadata = {
    ssoUrl: config.appUrl,
    entityId: config.entityId,
    certificate: config.publicKey,
  };

  return {
    props: {
      metadata,
      params: params ?? {},
    },
  };
};

export default Home;
