import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { hasWildcard } from 'lib/allowed-domains';
import config from 'lib/env';
import { parseNamespace } from 'lib/namespace';

const inputClass =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-2 focus:ring-primary/30';
const labelClass = 'mb-1 block text-sm font-medium text-gray-700';

const defaultAcsUrl = 'https://sso.eu.boxyhq.com/api/oauth/saml';
const defaultAudience = 'https://saml.boxyhq.com';

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const splitEmail = (email: string | undefined): [string?, string?] => {
  if (!email) return [];
  const at = email.lastIndexOf('@');
  return at < 0 ? [email] : [email.slice(0, at), email.slice(at + 1)];
};

export default function Login({
  allowedDomains,
  freeTextDomain,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const namespace = first(router.query.namespace);
  const acsUrl = first(router.query.acsUrl);
  const spInitiated = Boolean(acsUrl);

  const [prefillUser, prefillDomain] = splitEmail(first(router.query.email));
  const defaultDomain =
    prefillDomain && (freeTextDomain || allowedDomains.includes(prefillDomain))
      ? prefillDomain
      : (allowedDomains.find((d) => !d.startsWith('*')) ?? '');

  const authUrl = namespace ? `/api/namespace/${namespace}/saml/auth` : '/api/saml/auth';
  const hidden = Object.entries({
    id: first(router.query.id),
    providerName: first(router.query.providerName),
    relayState: first(router.query.relayState),
    ...(spInitiated && { acsUrl, audience: first(router.query.audience) || defaultAudience }),
  }).filter((entry): entry is [string, string] => Boolean(entry[1]));

  const acsUrlInp = useRef<HTMLInputElement>(null);
  const emailInp = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const target = spInitiated ? emailInp.current : acsUrlInp.current;
    target?.focus();
    target?.select();
  }, [spInitiated]);

  return (
    <>
      <Head>
        <title>Mock SAML Identity Provider - Login</title>
      </Head>

      <div className='flex min-h-screen justify-center bg-white pt-12'>
        <div className='w-full max-w-xl space-y-4 px-3'>
          <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
            <h2 className='mb-6 text-center text-2xl font-semibold text-gray-900'>
              {spInitiated ? 'SAML SSO Login' : 'SAML IdP Login'}
            </h2>

            <form method='POST' action={authUrl}>
              {hidden.map(([name, value]) => (
                <input key={name} type='hidden' name={name} value={value} />
              ))}

              <div className='grid grid-cols-2 gap-x-5 gap-y-3'>
                {!spInitiated && (
                  <div className='col-span-2 space-y-3'>
                    <div>
                      <label htmlFor='acsUrl' className={labelClass}>
                        ACS URL
                      </label>
                      <input
                        ref={acsUrlInp}
                        name='acsUrl'
                        id='acsUrl'
                        type='url'
                        required
                        autoComplete='off'
                        defaultValue={defaultAcsUrl}
                        placeholder={defaultAcsUrl}
                        className={inputClass}
                      />
                      <p className='mt-1 text-xs text-gray-500'>
                        This is where we will post the SAML Response
                      </p>
                    </div>

                    <div>
                      <label htmlFor='audience' className={labelClass}>
                        Audience
                      </label>
                      <input
                        name='audience'
                        id='audience'
                        type='text'
                        required
                        autoComplete='off'
                        defaultValue={defaultAudience}
                        placeholder={defaultAudience}
                        className={inputClass}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor='username' className={labelClass}>
                    Email
                  </label>
                  <input
                    ref={emailInp}
                    name='username'
                    id='username'
                    type='text'
                    required
                    pattern='[^@]+'
                    title='Username only; the domain is selected separately'
                    autoComplete='off'
                    defaultValue={prefillUser ?? 'jackson'}
                    placeholder='jackson'
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor='domain' className={labelClass}>
                    Domain
                  </label>
                  {freeTextDomain ? (
                    <input
                      name='domain'
                      id='domain'
                      type='text'
                      required
                      autoComplete='off'
                      defaultValue={defaultDomain}
                      placeholder='example.com'
                      className={inputClass}
                    />
                  ) : (
                    <select name='domain' id='domain' defaultValue={defaultDomain} className={inputClass}>
                      {allowedDomains.map((d) => (
                        <option key={d} value={d}>
                          @{d}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className='col-span-2'>
                  <label htmlFor='password' className={labelClass}>
                    Password
                  </label>
                  <input
                    id='password'
                    type='password'
                    autoComplete='off'
                    defaultValue='samlstrongpassword'
                    className={inputClass}
                  />
                  <p className='mt-1 text-xs text-gray-500'>Any password works</p>
                </div>

                <button
                  type='submit'
                  className='col-span-2 mt-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary/40'>
                  Sign In
                </button>
              </div>
            </form>
          </div>

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

// Server-rendered so the SP-initiated form does not flash the IdP one first.
export const getServerSideProps = (async ({ params }) => {
  if (!parseNamespace(params ?? {}).ok) {
    return { notFound: true };
  }

  return {
    props: {
      allowedDomains: config.allowedEmailDomains,
      freeTextDomain: hasWildcard(config.allowedEmailDomains),
    },
  };
}) satisfies GetServerSideProps;
