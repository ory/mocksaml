const NAMESPACE_PATTERN = /^[\w-]+$/;

type ParsedNamespace = { ok: true; namespace: string | undefined } | { ok: false };

export const parseNamespace = (query: { namespace?: string | string[] }): ParsedNamespace => {
  const { namespace } = query;

  if (namespace === undefined) {
    return { ok: true, namespace: undefined };
  }

  if (typeof namespace !== 'string' || !NAMESPACE_PATTERN.test(namespace)) {
    return { ok: false };
  }

  return { ok: true, namespace };
};

export const namespacePath = (namespace: string | undefined) => (namespace ? `/namespace/${namespace}` : '');

export const getEntityId = (entityId: string, namespace: string | undefined) =>
  namespace ? `${entityId}/${namespace}` : entityId;

export const getSSOUrl = (appUrl: string, namespace: string | undefined) =>
  `${appUrl}/api${namespacePath(namespace)}/saml/sso`;
