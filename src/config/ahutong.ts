function optionalHttpsUrl(value: string | undefined, name: string) {
  const input = value?.trim();
  if (!input) return undefined;
  const url = new URL(input);
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error(`${name} must be an HTTPS URL without credentials`);
  }
  return url.href;
}

export const ahutong = {
  androidDownloadUrl: "https://openahu.org/download/ahutong.apk",
  iosMinimumVersion: "17.0",
  iosIpaUrl: optionalHttpsUrl(
    import.meta.env.PUBLIC_AHUTONG_IOS_IPA_URL,
    "PUBLIC_AHUTONG_IOS_IPA_URL",
  ),
  waitlistFormUrl: optionalHttpsUrl(
    import.meta.env.PUBLIC_IOS_WAITLIST_FORM_URL,
    "PUBLIC_IOS_WAITLIST_FORM_URL",
  ),
};
