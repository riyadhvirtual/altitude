import { resolve } from 'path';

interface RouteParams {
  params: Promise<{
    path: string[];
  }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  const segments: string[] = (await params)?.path ?? [];
  const name = segments.join('/');

  if (!name) {
    return new Response('Not found', { status: 404 });
  }

  const baseDir = resolve(process.env.LOCAL_STORAGE_ROOT ?? 'data/uploads');
  const filePath = resolve(baseDir, name);

  if (!filePath.startsWith(baseDir)) {
    return new Response('Forbidden', { status: 403 });
  }

  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(file, {
    headers: { 'Content-Disposition': `inline; filename="${segments.at(-1)}"` },
  });
}
