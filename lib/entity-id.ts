import { namespacePath } from './namespace';

const getEntityId = (entityId: string, namespace: string | undefined) => {
  return namespace ? `${entityId}/${namespace}` : entityId;
};

const getSSOUrl = (appUrl: string, namespace: string | undefined) => {
  return `${appUrl}/api${namespacePath(namespace)}/saml/sso`;
};

export { getEntityId, getSSOUrl };
