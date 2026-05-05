import type { CourseSummary, CertificatePublic } from '@aura/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
      next: init?.cache === 'no-store' ? undefined : { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type CourseListFilters = { category?: string; q?: string };

export async function listCourses(filters: CourseListFilters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.set('category', filters.category);
  if (filters.q) params.set('q', filters.q);
  const qs = params.toString();
  const data = await fetchJson<{ courses: CourseSummary[] }>(
    `/public/courses${qs ? `?${qs}` : ''}`,
  );
  return data?.courses ?? [];
}

export async function getCourseBySlug(slug: string) {
  const data = await fetchJson<{ course: CourseSummary & { description?: string | null } }>(
    `/public/courses/${encodeURIComponent(slug)}`,
  );
  return data?.course ?? null;
}

export async function listCategories() {
  const data = await fetchJson<{ categories: Array<{ id: string; slug: string; name: string }> }>(
    `/public/categories`,
  );
  return data?.categories ?? [];
}

export async function getCertificate(code: string) {
  const data = await fetchJson<{ certificate: CertificatePublic }>(
    `/public/certificates/${encodeURIComponent(code)}`,
  );
  return data?.certificate ?? null;
}
