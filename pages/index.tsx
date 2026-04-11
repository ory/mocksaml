import Link from 'next/link';
import React from 'react';

const Home: React.FC = () => {
  return (
    <div className='flex items-center justify-center'>
      <div className='flex w-full max-w-4xl flex-col space-y-5 px-2'>
        <h1 className='text-center text-xl font-extrabold text-gray-900 md:text-2xl'>
          Mock Identity Providers
        </h1>
        <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
          <div className='border-2 p-5'>
            <h2 className='mb-3 text-center text-2xl font-bold text-gray-900'>Mock Sydney SSO</h2>
            <p className='mb-4 text-center text-sm text-gray-600'>
              SAML-based SSO for Anthem/Sydney integration testing.
            </p>
            <div className='flex justify-center'>
              <Link href='/saml/sydney' className='btn-outline btn-primary btn'>
                Test Sydney Login
              </Link>
            </div>
          </div>
          <div className='border-2 p-5'>
            <h2 className='mb-3 text-center text-2xl font-bold text-gray-900'>Mock Cigna Auth0</h2>
            <p className='mb-4 text-center text-sm text-gray-600'>
              OAuth2/OIDC endpoints for Cigna Auth0 SSO integration testing.
            </p>
            <div className='flex justify-center'>
              <Link href='/cigna-auth0/authorize' className='btn-outline btn-primary btn'>
                Test Cigna Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
