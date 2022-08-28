/**
 * Based on `parse-package-name` (https://npmjs.com/parse-package-name) by @egoist (https://github.com/egoist)
 */

/** Parsed a scoped package name into name, version, and path. */
export const RE_SCOPED = /^(@[^\/]+\/[^@\/]+)(?:@([^\/]+))?(\/.*)?$/;

/** Parsed a non-scoped package name into name, version, path */
export const RE_NON_SCOPED = /^([^@\/]+)(?:@([^\/]+))?(\/.*)?$/;

export function parsePackageName(input: string) {
  const m = RE_SCOPED.exec(input) || RE_NON_SCOPED.exec(input);

  if (!m) {
    throw new Error(`[parse-package-name] invalid package name: ${input}`);
  }

  return {
    name: m[1] || '',
    version: m[2] || 'latest',
    path: m[3] || '',
  };
}

/**
 * Returns registry url for packages which have an input string
 *
 * @param input package to generate npm registry url for; it supports adding package versions "@okikio/animate@1.0"
 * @returns the proper npm registry url with package input package versions etc...
 */
export const getRegistryURL = (input: string) => {
  const host = 'https://registry.npmjs.com';

  let { name, version, path } = parsePackageName(input);
  let searchURL = `${host}/-/v1/search?text=${encodeURIComponent(
    name
  )}&popularity=0.5&size=30`;
  let packageVersionURL = `${host}/${name}/${version}`;
  let packageURL = `${host}/${name}`;

  return { searchURL, packageURL, packageVersionURL, version, name, path };
};

/**
 * Searches the npm registry for packages with matching names
 *
 * @param input package name to search for; it supports adding package versions "@okikio/animate@1.0", but will ignore them
 * @returns resulting package info.
 */
export const getPackages = async (input: string) => {
  let { searchURL } = getRegistryURL(input);
  let result: any;

  try {
    let response = await fetch(searchURL);
    result = await response.json();
  } catch (e) {
    console.warn(e);
    throw e;
  }

  let packages = result?.objects;
  return { packages, info: result };
};

export const toLocaleDateString = (date: string | number | Date) => {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};