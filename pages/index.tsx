import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Link from 'next/link';
import config from 'lib/env';
import { getEntityId, getSSOUrl } from 'lib/entity-id';
import { namespacePath, parseNamespace } from 'lib/namespace';

const buttonClass =
  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary-ring';
const primaryButtonClass = `${buttonClass} bg-primary text-white hover:bg-primary-hover`;
const outlineButtonClass = `${buttonClass} border border-primary text-primary hover:bg-primary-soft`;
const readOnlyClass = 'w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700';
const labelClass = 'mb-1 block text-sm font-medium text-gray-700';

export default function Home({
  ssoUrl,
  entityId,
  certificate,
  metadataUrl,
  loginUrl,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div className='flex min-h-screen justify-center bg-white pt-12'>
      <div className='w-full max-w-4xl px-2 space-y-6'>
        <h1 className='text-center text-xl font-semibold text-gray-900 md:text-2xl'>
          A free SAML 2.0 Identity Provider for testing SAML SSO integrations.
        </h1>

        {/* Actions */}
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='flex flex-col gap-3 md:flex-row'>
            <Link href={`${metadataUrl}?download=true`} className={primaryButtonClass}>
              Download Metadata
            </Link>

            <Link href={metadataUrl} target='_blank' className={outlineButtonClass}>
              Metadata URL
            </Link>
          </div>

          <Link href={loginUrl} className={outlineButtonClass}>
            Test IdP Login
          </Link>
        </div>

        {/* Metadata Card */}
        <div className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm'>
          <h2 className='mb-5 text-center text-2xl font-semibold text-gray-900'>Mock SAML Metadata</h2>
          <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
            <div>
              <label htmlFor='ssoUrl' className={labelClass}>
                SSO URL
              </label>
              <input id='ssoUrl' type='text' defaultValue={ssoUrl} disabled className={readOnlyClass} />
            </div>

            <div>
              <label htmlFor='entityId' className={labelClass}>
                Entity ID
              </label>
              <input id='entityId' type='text' defaultValue={entityId} disabled className={readOnlyClass} />
            </div>

            <div className='md:col-span-2'>
              <label htmlFor='certificate' className={labelClass}>
                Certificate
              </label>
              <textarea
                id='certificate'
                defaultValue={certificate}
                disabled
                className={`${readOnlyClass} h-48 font-mono`}
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
}

export const getServerSideProps = (async ({ params }) => {
  const parsed = parseNamespace(params ?? {});
  if (!parsed.ok) {
    return { notFound: true };
  }

  const { namespace } = parsed;

  return {
    props: {
      ssoUrl: getSSOUrl(config.appUrl, namespace),
      entityId: getEntityId(config.entityId, namespace),
      certificate: config.publicKey,
      metadataUrl: `/api${namespacePath(namespace)}/saml/metadata`,
      loginUrl: `${namespacePath(namespace)}/saml/login`,
    },
  };
}) satisfies GetServerSideProps;
