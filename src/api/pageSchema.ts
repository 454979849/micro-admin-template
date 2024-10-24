import { env, host } from '@/components/use-schema-render/config';

/**
 * 查找页面schema
 */
export async function findPageSchemaByNodeId(params: { nodeId: number }) {
  const response = await fetch(
    `${env === 'localhost' ? '/api' : host}/page-schema/${params.nodeId}`,
    {
      method: 'get',
    }
  );
  const res = await response.json();
  if (res.code == 1) {
    res.data.package = JSON.parse(res.data.package || '[]');
    res.data.schema = JSON.parse(res.data.schema || '{}');
  }
  return res;
}
