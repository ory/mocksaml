import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import type { FormEvent } from 'react';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { hasWildcard } from 'lib/allowed-domains';
import { authRequestBody, defaultAcsUrl, defaultAudience } from 'lib/auth-request';

type LoginProps = { allowedDomains: string[]; freeTextDomain: boolean };

export const getServerSideProps: GetServerSideProps<LoginProps> = async () => {
  const { default: config } = await import('lib/env');

  return {
    props: {
      allowedDomains: config.allowedEmailDomains,
      freeTextDomain: hasWildcard(config.allowedEmailDomains),
    },
  };
};

export default function Login({ allowedDomains, freeTextDomain }: LoginProps) {
  const router = useRouter();
  const { acsUrl, namespace, email } = router.query;
  const [prefillUser, prefillDomain] = splitEmail(email);
  const acceptedPrefillDomain =
    prefillDomain && (freeTextDomain || allowedDomains.includes(prefillDomain)) ? prefillDomain : undefined;

  const authUrl = namespace ? `/api/namespace/${namespace}/saml/auth` : '/api/saml/auth';
  const defaults = {
    username: prefillUser ?? 'jackson',
    domain: acceptedPrefillDomain ?? allowedDomains.find((d) => !d.startsWith('*')) ?? '',
    acsUrl: defaultAcsUrl,
    audience: defaultAudience,
  };
  const hydrated = useHydrated();

  const acsUrlInp = useRef<HTMLInputElement>(null);
  const emailInp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (acsUrl && emailInp.current) {
      emailInp.current.focus();
      emailInp.current.select();
    } else if (acsUrlInp.current) {
      acsUrlInp.current.focus();
      acsUrlInp.current.select();
    }
  }, [acsUrl]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // The inputs are uncontrolled and read from the form, so text typed before hydration is what gets sent.
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authRequestBody(new FormData(e.currentTarget), router.query)),
    });

    if (response.ok) {
      const newDoc = document.open('text/html', 'replace');
      newDoc.write(await response.text());
      newDoc.close();
    } else {
      document.write('Error in getting SAML response');
    }
  };

  return (
    <>
      <Head>
        <title>Mock SAML Identity Provider - Login</title>
      </Head>

      <div className='flex min-h-screen justify-center bg-white pt-12'>
        <div className='w-full max-w-xl px-3 space-y-4'>
          {/* Card */}
          <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
            <h2 className='mb-6 text-center text-2xl font-semibold text-gray-900'>
              {!acsUrl ? 'SAML IdP Login' : 'SAML SSO Login'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className='grid grid-cols-2 gap-x-5 gap-y-3'>
                {!acsUrl && (
                  <div className='col-span-2 space-y-3'>
                    <div>
                      <label className='block mb-1 text-sm font-medium text-gray-700'>ACS URL</label>
                      <input
                        ref={acsUrlInp}
                        name='acsUrl'
                        id='acsUrl'
                        type='text'
                        autoComplete='off'
                        defaultValue={defaults.acsUrl}
                        placeholder='https://sso.eu.boxyhq.com/api/oauth/saml'
                        className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30'
                      />
                      <p className='mt-1 text-xs text-gray-500'>
                        This is where we will post the SAML Response
                      </p>
                    </div>

                    <div>
                      <label className='block mb-1 text-sm font-medium text-gray-700'>Audience</label>
                      <input
                        name='audience'
                        id='audience'
                        type='text'
                        autoComplete='off'
                        defaultValue={defaults.audience}
                        placeholder='https://saml.boxyhq.com'
                        className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30'
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className='block mb-1 text-sm font-medium text-gray-700'>Email</label>
                  <input
                    ref={emailInp}
                    name='username'
                    id='username'
                    type='text'
                    autoComplete='off'
                    defaultValue={defaults.username}
                    placeholder='jackson'
                    className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30'
                  />
                </div>

                <div>
                  <label className='block mb-1 text-sm font-medium text-gray-700'>Domain</label>
                  {freeTextDomain ? (
                    <input
                      name='domain'
                      id='domain'
                      type='text'
                      autoComplete='off'
                      defaultValue={defaults.domain}
                      placeholder='example.com'
                      className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30'
                    />
                  ) : (
                    <select
                      name='domain'
                      id='domain'
                      defaultValue={defaults.domain}
                      className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30'>
                      {allowedDomains.map((d) => (
                        <option key={d} value={d}>
                          @{d}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className='col-span-2'>
                  <label className='block mb-1 text-sm font-medium text-gray-700'>Password</label>
                  <input
                    id='password'
                    type='password'
                    autoComplete='off'
                    defaultValue='samlstrongpassword'
                    className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30'
                  />
                  <p className='mt-1 text-xs text-gray-500'>Any password works</p>
                </div>

                {/* Until hydration a click would submit the form natively and drop the SAML request. */}
                <button
                  type='submit'
                  disabled={!hydrated}
                  className='col-span-2 mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40'>
                  Sign In
                </button>
              </div>
            </form>
          </div>

          {/* Info box */}
          <div className='rounded-md border border-blue-200 bg-blue-50 p-4'>
            <p className='text-sm text-blue-900'>
              This is a simulated login screen. You may choose any username, but only the domains{' '}
              <code className='font-mono'>{allowedDomains.join(', ')}</code> are allowed.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

const subscribeNever = () => () => {};

function useHydrated() {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );
}

function splitEmail(email: string | string[] | undefined): [string?, string?] {
  if (typeof email !== 'string') {
    return [];
  }
  const at = email.lastIndexOf('@');
  return at < 0 ? [email] : [email.slice(0, at), email.slice(at + 1)];
}
