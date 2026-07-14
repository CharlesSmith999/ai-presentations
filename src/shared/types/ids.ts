/**
 * Branded primitive types. A plain `string` for every ID means the
 * compiler will happily let you pass a `UserId` where a
 * `PresentationId` is expected. Branding closes that hole at zero
 * runtime cost — a compile-time-only tag.
 *
 * Only `UserId` is used anywhere in Sprint 0 (in the auth helper's
 * return type). The others are declared now, alongside it, so the ID
 * convention is fixed once for the whole project rather than
 * reinvented per feature.
 */
type Brand<T, B extends string> = T & { readonly __brand: B };

export type UserId = Brand<string, "UserId">;
export type OrganizationId = Brand<string, "OrganizationId">;
export type ConsultationId = Brand<string, "ConsultationId">;
export type PresentationId = Brand<string, "PresentationId">;
export type SlideId = Brand<string, "SlideId">;

export const asUserId = (value: string): UserId => value as UserId;
export const asOrganizationId = (value: string): OrganizationId => value as OrganizationId;
export const asConsultationId = (value: string): ConsultationId => value as ConsultationId;
export const asPresentationId = (value: string): PresentationId => value as PresentationId;
export const asSlideId = (value: string): SlideId => value as SlideId;

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}
