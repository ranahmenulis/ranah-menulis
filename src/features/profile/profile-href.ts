/** A public author profile (COM-10). The handle is the author's username, without "@". */
export const profileHref = (handle: string) => `/penulis/${handle}`;

/**
 * The reader's own profile, behind the "Profil" navigation entry. [konfirmasi] It is the dummy user
 * while sign-in is bypassed; a test keeps it equal to the dummy author's handle.
 */
export const OWN_PROFILE_HREF = profileHref("rinjaniputri");
